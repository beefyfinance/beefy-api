import { URLSearchParams } from 'node:url';
import { decodeAbiParameters, decodeFunctionData, isHex, parseAbi } from 'viem';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { redactSecrets } from '../../../../utils/secrets.ts';
import { type ApiResponse, type ExtraQuoteResponse, isErrorApiResponse } from '../common.ts';
import {
  ENSO_NATIVE_ADDRESS,
  type EnsoEffort,
  type EnsoErrorResponse,
  type EnsoQuoteRequest,
  type EnsoQuoteResponse,
  type EnsoRouteResponse,
  type EnsoSwapRequest,
  type EnsoSwapResponse,
  type IEnsoApi,
  isEnsoErrorResponse,
  isEnsoSuccessResponse,
} from './types.ts';

const logger = getLoggerFor({ module: 'zap', component: 'enso' });

const ROUTE_SINGLE_SELECTOR = '0xb94c3609';
const routerAbi = parseAbi(['function routeSingle((uint8 tokenType, bytes data) tokenIn, bytes data) payable']);
const TOKEN_TYPE_NATIVE = 0;
const TOKEN_TYPE_ERC20 = 1;

// Below the queue timeout, so timed out requests are actually cancelled
const FETCH_TIMEOUT_MS = 25 * 1000;
// Slowest measured successful call was ~3s; fail fast so a hung request doesn't hold a proxy slot
const PROXY_FETCH_TIMEOUT_MS = 10 * 1000;

type ProxiedQuoteResponse = ApiResponse<EnsoQuoteResponse, ExtraQuoteResponse>;

export class EnsoApi implements IEnsoApi {
  constructor(
    protected readonly baseUrl: string,
    protected readonly chainId: number,
    protected readonly routers: readonly string[],
    protected readonly zapRouter: string,
    protected readonly apiKey: string,
    protected readonly effort: EnsoEffort
  ) {}

  async getQuote(request: EnsoQuoteRequest): Promise<EnsoQuoteResponse> {
    const response = await this.get<EnsoQuoteResponse>('/shortcuts/quote', this.buildQuoteParams(request));

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async getProxiedQuote(request: EnsoQuoteRequest): Promise<ProxiedQuoteResponse> {
    return await this.priorityGet('/shortcuts/quote', this.buildQuoteParams(request), {
      fee: {
        value: 0,
      },
    });
  }

  async getProxiedSwap(request: EnsoSwapRequest): Promise<ApiResponse<EnsoSwapResponse>> {
    const response = await this.priorityGet<EnsoRouteResponse>('/shortcuts/route', this.buildRouteParams(request));
    if (isErrorApiResponse(response)) {
      return response;
    }

    const validated = validateRouteResponse(request, response.data, this.routers, this.zapRouter);
    if (isErrorApiResponse(validated)) {
      logger.warn({ chainId: this.chainId, reason: validated.message }, 'enso route rejected');
    }
    return validated;
  }

  protected buildQuoteParams(request: EnsoQuoteRequest): Record<string, string> {
    return {
      chainId: this.chainId.toString(),
      routingStrategy: 'router',
      effort: this.effort,
      tokenIn: normalizeTokenAddress(request.tokenIn),
      tokenOut: normalizeTokenAddress(request.tokenOut),
      amountIn: request.amountIn,
      ...(request.ignoreAggregators ? { ignoreAggregators: request.ignoreAggregators } : {}),
    };
  }

  protected buildRouteParams(request: EnsoSwapRequest): Record<string, string> {
    return {
      ...this.buildQuoteParams(request),
      fromAddress: request.fromAddress,
      receiver: request.fromAddress,
      refundReceiver: request.fromAddress,
      // Never with slippage: Enso rejects both together
      minAmountOut: request.minAmountOut,
      referralCode: 'beefy',
    };
  }

  protected buildUrl(path: string, request: Record<string, string>) {
    const queryString = new URLSearchParams(request).toString();
    return queryString ? `${this.baseUrl}${path}?${queryString}` : `${this.baseUrl}${path}`;
  }

  protected async doGet<ResponseType extends object, Extra extends Record<string, unknown> | undefined = undefined>(
    path: string,
    request: Record<string, string>,
    extra?: Extra,
    timeoutMs: number = FETCH_TIMEOUT_MS
  ): Promise<ApiResponse<ResponseType, Extra>> {
    const start = Date.now();
    const response = await fetch(this.buildUrl(path, request), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BeefyApi',
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    logger.debug(
      {
        chainId: this.chainId,
        path,
        status: response.status,
        requestId: response.headers.get('x-request-id'),
        creditsRemaining: response.headers.get('x-enso-credits-remaining'),
        rateLimitRemaining: response.headers.get('x-ratelimit-remaining'),
        durationMs: Date.now() - start,
      },
      'enso response'
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

    if (response.status === 200 && isEnsoSuccessResponse(body)) {
      return {
        code: 200,
        data: body as ResponseType,
      };
    }

    if (isEnsoErrorResponse(body)) {
      return {
        code: response.status === 200 ? 500 : response.status,
        message: redactSecrets(ensoErrorMessage(body)),
      };
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

function normalizeTokenAddress(address: string): string {
  return address.toLowerCase() === ENSO_NATIVE_ADDRESS ? ENSO_NATIVE_ADDRESS : address;
}

function ensoErrorMessage(body: EnsoErrorResponse): string {
  const message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
  return message || body.error || 'unknown error';
}

function toUint(value: unknown): bigint | undefined {
  return typeof value === 'string' && /^\d+$/.test(value) ? BigInt(value) : undefined;
}

function isSameAddress(a: unknown, b: string): boolean {
  return typeof a === 'string' && a.toLowerCase() === b.toLowerCase();
}

function invalidRoute(reason: string): ApiResponse<EnsoSwapResponse> {
  return { code: 502, message: `Invalid Enso route: ${reason}` };
}

/**
 * The zap router approves and calls whatever tx.to/data we return, so check the calldata
 * spends exactly what was requested via a known router, before handing it to the app
 */
function validateRouteResponse(
  request: EnsoSwapRequest,
  route: EnsoRouteResponse,
  routers: readonly string[],
  zapRouter: string
): ApiResponse<EnsoSwapResponse> {
  const { tx } = route;
  if (!tx || typeof tx.to !== 'string' || typeof tx.data !== 'string') {
    return invalidRoute('missing tx');
  }
  if (tx.from !== undefined && !isSameAddress(tx.from, zapRouter)) {
    return invalidRoute(`unexpected from ${tx.from}`);
  }
  if (typeof route.amountOut !== 'string' || typeof route.minAmountOut !== 'string') {
    return invalidRoute('missing amountOut/minAmountOut');
  }
  if (!routers.some(router => isSameAddress(tx.to, router))) {
    return invalidRoute(`unknown router ${tx.to}`);
  }
  if (!isHex(tx.data) || !tx.data.toLowerCase().startsWith(ROUTE_SINGLE_SELECTOR)) {
    return invalidRoute(`unexpected selector ${tx.data.slice(0, 10)}`);
  }

  const amountIn = toUint(request.amountIn);
  const value = toUint(tx.value);
  if (amountIn === undefined || value === undefined) {
    return invalidRoute('invalid amountIn/value');
  }

  try {
    const { args } = decodeFunctionData({ abi: routerAbi, data: tx.data });
    const [tokenIn] = args;
    if (request.tokenIn.toLowerCase() === ENSO_NATIVE_ADDRESS) {
      if (tokenIn.tokenType !== TOKEN_TYPE_NATIVE) {
        return invalidRoute(`unexpected token type ${tokenIn.tokenType}`);
      }
      const [amount] = decodeAbiParameters([{ type: 'uint256' }], tokenIn.data);
      if (amount !== amountIn) {
        return invalidRoute('amountIn mismatch');
      }
      if (value !== amountIn) {
        return invalidRoute('value mismatch');
      }
    } else {
      if (tokenIn.tokenType !== TOKEN_TYPE_ERC20) {
        return invalidRoute(`unexpected token type ${tokenIn.tokenType}`);
      }
      const [token, amount] = decodeAbiParameters([{ type: 'address' }, { type: 'uint256' }], tokenIn.data);
      if (!isSameAddress(token, request.tokenIn)) {
        return invalidRoute('tokenIn mismatch');
      }
      if (amount !== amountIn) {
        return invalidRoute('amountIn mismatch');
      }
      if (value !== 0n) {
        return invalidRoute('value mismatch');
      }
    }
  } catch {
    return invalidRoute('calldata decode failed');
  }

  const preTransactions = route.preTransactions || [];
  if (!preTransactions.every(preTx => isSameAddress(preTx?.spender, tx.to))) {
    return invalidRoute('unexpected approval spender');
  }

  const minAmountOut = toUint(route.minAmountOut);
  const requestedMinAmountOut = toUint(request.minAmountOut);
  if (minAmountOut === undefined || requestedMinAmountOut === undefined || minAmountOut < requestedMinAmountOut) {
    return invalidRoute('minAmountOut below requested');
  }

  return {
    code: 200,
    data: {
      amountOut: route.amountOut,
      minAmountOut: route.minAmountOut,
      gas: route.gas,
      priceImpact: route.priceImpact,
      tx: {
        to: tx.to,
        from: tx.from,
        data: tx.data,
        value: tx.value,
      },
    },
  };
}
