import { createHmac } from 'node:crypto';
import { URLSearchParams } from 'node:url';
import { BigNumber } from 'bignumber.js';
import { isHex } from 'viem';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { redactSecrets } from '../../../../utils/secrets.ts';
import { CircuitBreaker } from '../circuit-breaker.ts';
import { type ApiResponse, type ExtraQuoteResponse, isErrorApiResponse } from '../common.ts';
import { QuoteCache } from '../quote-cache.ts';
import { type DecodedRouterCall, decodeRouterCall } from './router.ts';
import {
  type IOkxApi,
  isOkxEnvelope,
  OKX_NATIVE_ADDRESS,
  type OkxQuoteRequest,
  type OkxQuoteResponse,
  type OkxRouteResponse,
  type OkxSwapRequest,
  type OkxSwapResponse,
} from './types.ts';

const logger = getLoggerFor({ module: 'zap', component: 'okx' });

const QUOTE_PATH = '/api/v6/dex/aggregator/quote';
const SWAP_PATH = '/api/v6/dex/aggregator/swap';

const AUTH_FAILED_OPEN_MS = 60 * 60 * 1000;
// Below the queue timeout, so timed out requests are actually cancelled
const FETCH_TIMEOUT_MS = 25 * 1000;
const PROXY_FETCH_TIMEOUT_MS = 10 * 1000;
// The app re-quotes the same swap often, and every call counts against the 1 RPS key limit
const QUOTE_CACHE_TTL_MS = 10 * 1000;
// The app assumes swaps stay valid for 1h (cross-chain dest swaps execute later); 1m allows for latency/clock skew
const MIN_DEADLINE_SECONDS = 60 * 60 - 60;

const okxCircuitBreaker = new CircuitBreaker('OKX', logger);

export function isOkxCircuitOpenedSince(timestamp: number): boolean {
  return okxCircuitBreaker.openedSince(timestamp);
}

type ProxiedQuoteResponse = ApiResponse<OkxQuoteResponse, ExtraQuoteResponse>;

export class OkxApi implements IOkxApi {
  constructor(
    protected readonly baseUrl: string,
    protected readonly chainId: number,
    protected readonly routers: readonly string[],
    protected readonly approveAddress: string,
    protected readonly zapRouter: string,
    protected readonly apiKey: string,
    protected readonly apiSecret: string,
    protected readonly apiPassphrase: string
  ) {}

  protected readonly breaker = okxCircuitBreaker;
  protected readonly quoteCache = new QuoteCache<ProxiedQuoteResponse>(QUOTE_CACHE_TTL_MS);

  async getQuote(request: OkxQuoteRequest): Promise<OkxQuoteResponse> {
    const response = await this.get<OkxQuoteResponse>(QUOTE_PATH, this.buildQuoteParams(request));

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async getProxiedQuote(request: OkxQuoteRequest): Promise<ProxiedQuoteResponse> {
    const params = this.buildQuoteParams(request);
    const key = [
      params.fromTokenAddress,
      params.toTokenAddress,
      params.amount,
      params.disableRFQ,
      params.excludeDexIds,
    ].join(':');
    return await this.quoteCache.get(key, () =>
      this.priorityGet(QUOTE_PATH, params, {
        fee: {
          value: 0,
        },
      })
    );
  }

  async getProxiedSwap(request: OkxSwapRequest): Promise<ApiResponse<OkxSwapResponse>> {
    const response = await this.priorityGet<OkxRouteResponse>(SWAP_PATH, this.buildSwapParams(request));
    if (isErrorApiResponse(response)) {
      return response;
    }

    const validated = validateSwapResponse(request, response.data, this.routers, this.approveAddress, this.zapRouter);
    if (isErrorApiResponse(validated)) {
      logger.warn({ chainId: this.chainId, reason: validated.message }, 'okx swap rejected');
    }
    return validated;
  }

  protected buildQuoteParams(request: OkxQuoteRequest): Record<string, string> {
    return {
      chainIndex: this.chainId.toString(),
      amount: request.amountIn,
      fromTokenAddress: request.tokenIn.toLowerCase(),
      toTokenAddress: request.tokenOut.toLowerCase(),
      swapMode: 'exactIn',
      ...(request.excludeRfq === 'true' ? { disableRFQ: 'true' } : {}),
      ...(request.excludeDexIds ? { excludeDexIds: request.excludeDexIds } : {}),
    };
  }

  protected buildSwapParams(request: OkxSwapRequest): Record<string, string> {
    return {
      ...this.buildQuoteParams(request),
      slippagePercent: new BigNumber(request.slippage).times(100).toString(10),
      userWalletAddress: request.fromAddress,
      swapReceiverAddress: request.fromAddress,
    };
  }

  protected buildHeaders(path: string, queryString: string): Record<string, string> {
    const timestamp = new Date().toISOString();
    const sign = createHmac('sha256', this.apiSecret).update(`${timestamp}GET${path}${queryString}`).digest('base64');
    return {
      Accept: 'application/json',
      // Cloudflare rejects requests without a User-Agent
      'User-Agent': 'BeefyApi',
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.apiPassphrase,
    };
  }

  protected async doGet<ResponseType extends object, Extra extends Record<string, unknown> | undefined = undefined>(
    path: string,
    request: Record<string, string>,
    extra?: Extra,
    timeoutMs: number = FETCH_TIMEOUT_MS
  ): Promise<ApiResponse<ResponseType, Extra>> {
    if (this.breaker.isOpen()) {
      return { code: 503, message: this.breaker.message };
    }

    const params = new URLSearchParams(request).toString();
    // The signature must cover the exact query string sent
    const queryString = params ? `?${params}` : '';
    const start = Date.now();
    const response = await fetch(`${this.baseUrl}${path}${queryString}`, {
      headers: this.buildHeaders(path, queryString),
      signal: AbortSignal.timeout(timeoutMs),
    });

    logger.debug(
      {
        chainId: this.chainId,
        path,
        status: response.status,
        durationMs: Date.now() - start,
      },
      'okx response'
    );

    const apiResponse = await this.handleResponse<ResponseType>(response);
    if (isErrorApiResponse(apiResponse)) {
      return apiResponse;
    }

    return {
      ...apiResponse,
      ...(extra === undefined ? {} : { extra }),
    };
  }

  protected async handleResponse<ResponseType extends object>(response: Response): Promise<ApiResponse<ResponseType>> {
    const isJson = !!response.headers.get('content-type')?.includes('application/json');
    const body: unknown = isJson ? await response.json().catch(() => undefined) : undefined;
    const envelope = isOkxEnvelope(body) ? body : undefined;

    if (response.status === 401 || (envelope && isAuthErrorCode(envelope.code))) {
      this.breaker.open(AUTH_FAILED_OPEN_MS, `auth rejected (${envelope?.code ?? response.status})`);
    }

    if (envelope) {
      if (response.status === 200 && envelope.code === '0') {
        const data = envelope.data?.[0];
        if (data && typeof data === 'object') {
          return { code: 200, data: data as ResponseType };
        }
        return { code: 500, message: 'empty okx response' };
      }

      const message = redactSecrets(`${envelope.code}: ${envelope.msg || 'unknown error'}`);
      if (envelope.code === RATE_LIMIT_CODE) {
        return { code: 429, message };
      }
      return { code: response.status === 200 ? 500 : response.status, message };
    }

    if (isJson && response.status === 200) {
      return {
        code: 500,
        message: 'unexpected json response',
      };
    }

    return {
      code: response.status === 200 ? 500 : response.status,
      message: response.status === 200 ? 'upstream response not json' : redactSecrets(response.statusText),
    };
  }

  protected async get<ResponseType extends object>(
    path: string,
    request: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doGet(path, request);
  }

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined,
  >(path: string, request: Record<string, string>, extra?: Extra): Promise<ApiResponse<ResponseType, Extra>> {
    return this.doGet(path, request, extra, PROXY_FETCH_TIMEOUT_MS);
  }
}

const RATE_LIMIT_CODE = '50011';

/** 501xx are api key/sign/passphrase/timestamp errors */
function isAuthErrorCode(code: string): boolean {
  return /^501\d\d$/.test(code);
}

function toUint(value: unknown): bigint | undefined {
  return typeof value === 'string' && /^\d+$/.test(value) ? BigInt(value) : undefined;
}

function isSameAddress(a: unknown, b: string): boolean {
  return typeof a === 'string' && a.toLowerCase() === b.toLowerCase();
}

function invalidSwap(reason: string): ApiResponse<OkxSwapResponse> {
  return { code: 502, message: `Invalid OKX swap: ${reason}` };
}

/**
 * The zap router approves and calls whatever tx.to/data we return, so check the calldata
 * spends exactly what was requested via a known router, before handing it to the app
 */
function validateSwapResponse(
  request: OkxSwapRequest,
  swap: OkxRouteResponse,
  routers: readonly string[],
  approveAddress: string,
  zapRouter: string
): ApiResponse<OkxSwapResponse> {
  const { tx, routerResult } = swap;
  if (!tx || typeof tx.to !== 'string' || typeof tx.data !== 'string') {
    return invalidSwap('missing tx');
  }
  if (!routerResult || typeof routerResult !== 'object') {
    return invalidSwap('missing routerResult');
  }
  if (tx.from !== undefined && !isSameAddress(tx.from, zapRouter)) {
    return invalidSwap(`unexpected from ${tx.from}`);
  }
  if (!routers.some(router => isSameAddress(tx.to, router))) {
    return invalidSwap(`unknown router ${tx.to}`);
  }
  if (!isHex(tx.data)) {
    return invalidSwap('invalid calldata');
  }

  const amountIn = toUint(request.amountIn);
  const value = toUint(tx.value);
  if (amountIn === undefined || value === undefined) {
    return invalidSwap('invalid amountIn/value');
  }

  const isNativeIn = request.tokenIn.toLowerCase() === OKX_NATIVE_ADDRESS;
  if (value !== (isNativeIn ? amountIn : 0n)) {
    return invalidSwap('value mismatch');
  }
  if (toUint(routerResult.fromTokenAmount) !== amountIn) {
    return invalidSwap('amountIn mismatch');
  }
  if (!isSameAddress(routerResult.fromToken?.tokenContractAddress, request.tokenIn)) {
    return invalidSwap('tokenIn mismatch');
  }
  if (!isSameAddress(routerResult.toToken?.tokenContractAddress, request.tokenOut)) {
    return invalidSwap('tokenOut mismatch');
  }

  const toAmount = toUint(routerResult.toTokenAmount);
  const minToAmount = toUint(tx.minReceiveAmount);
  const requestedMinToAmount = toUint(request.minAmountOut);
  if (toAmount === undefined || minToAmount === undefined || requestedMinToAmount === undefined) {
    return invalidSwap('missing toTokenAmount/minReceiveAmount');
  }
  if (minToAmount < requestedMinToAmount) {
    // Re-quote moved below the min the app asked for, not a bad response
    return { code: 409, message: 'OKX quote changed: minReceiveAmount below requested minAmountOut' };
  }
  const slippageBps = BigInt(
    new BigNumber(request.slippage).times(10000).integerValue(BigNumber.ROUND_CEIL).toString(10)
  );
  // -1 allows for OKX rounding
  const lowestMinToAmount = (toAmount * (10000n - slippageBps)) / 10000n - 1n;
  if (minToAmount > toAmount || minToAmount < lowestMinToAmount) {
    return invalidSwap('minReceiveAmount outside slippage');
  }

  // The response fields above are only metadata, the calldata is what actually executes
  let call: DecodedRouterCall;
  try {
    call = decodeRouterCall(tx.data);
  } catch (err) {
    return invalidSwap(`unexpected calldata ${tx.data.slice(0, 10)}: ${err instanceof Error ? err.message : err}`);
  }
  if (call.receiver !== undefined && !isSameAddress(call.receiver, zapRouter)) {
    return invalidSwap(`unexpected receiver ${call.receiver}`);
  }
  if (call.fromToken !== undefined && !isSameAddress(call.fromToken, request.tokenIn)) {
    return invalidSwap('calldata tokenIn mismatch');
  }
  // Router-only variants derive toToken from the pools; the zap router checks what it receives
  if (call.toToken !== undefined && !isSameAddress(call.toToken, request.tokenOut)) {
    return invalidSwap('calldata tokenOut mismatch');
  }
  if (call.amount !== amountIn) {
    return invalidSwap('calldata amountIn mismatch');
  }
  if (call.minReturn !== minToAmount) {
    return invalidSwap('calldata minReturn mismatch');
  }
  if (call.deadline !== undefined && call.deadline < BigInt(Math.floor(Date.now() / 1000) + MIN_DEADLINE_SECONDS)) {
    return invalidSwap(`deadline too soon ${call.deadline}`);
  }
  // The quoted toAmount must reach the zap router, okx may only keep output above it
  if (call.trimExpectAmountOut !== undefined && call.trimExpectAmountOut < toAmount) {
    return invalidSwap('positive slippage trim below toTokenAmount');
  }

  return {
    code: 200,
    data: {
      toAmount: routerResult.toTokenAmount,
      minToAmount: tx.minReceiveAmount,
      priceImpactPercent: routerResult.priceImpactPercent,
      gas: tx.gas,
      tx: {
        to: tx.to,
        from: tx.from,
        data: tx.data,
        value: tx.value,
      },
      approveAddress: isNativeIn ? undefined : approveAddress,
    },
  };
}
