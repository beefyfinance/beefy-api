import type { ParsedUrlQuery } from 'node:querystring';
import { isAddress, maxUint256 } from 'viem';
import type { ApiChain } from '../../../utils/chain.ts';
import { errorToString } from '../../../utils/error.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { redactSecrets } from '../../../utils/secrets.ts';
import { withChainId } from '../../vaults/helpers.ts';
import {
  type ApiResponse,
  type ErrorApiResponse,
  type ExtraQuoteResponse,
  getZapRouter,
  isSuccessApiResponse,
} from '../api/common.ts';
import { getOkxApi } from '../api/okx/index.ts';
import {
  OKX_NATIVE_ADDRESS,
  type OkxQuoteRequest,
  type OkxQuoteResponse,
  type OkxSwapRequest,
  type OkxSwapResponse,
} from '../api/okx/types.ts';
import { getTokenSwapSupport } from '../swap/index.ts';
import { isQuoteValueTooLow, isRateLimited, setNoCacheHeaders, setRateLimitedResponse } from './common.ts';

const logger = getLoggerFor({ module: 'zap', component: 'okx' });

const QUOTE_PARAMS = ['tokenIn', 'tokenOut', 'amountIn'] as const;
const SWAP_PARAMS = [...QUOTE_PARAMS, 'fromAddress', 'slippage', 'minAmountOut'] as const;
const OPTIONAL_PARAMS = ['excludeRfq', 'excludeDexIds'] as const;
const ADDRESS_PARAMS = new Set<string>(['tokenIn', 'tokenOut', 'fromAddress']);
const AMOUNT_REGEX = /^[1-9]\d{0,77}$/;
// Fraction with at most 4 decimals, so it is a whole number of basis points
const SLIPPAGE_REGEX = /^0?\.\d{1,4}$/;
const MAX_SLIPPAGE = 0.5;
const DEX_IDS_REGEX = /^\d{1,6}(,\d{1,6}){0,19}$/;

type OptionalParams = { excludeRfq?: string; excludeDexIds?: string };

function badRequest(message: string): ErrorApiResponse {
  return { code: 400, message };
}

/**
 * Only forward known params, so callers can't use our key for anything else (e.g. adding a fee)
 */
function parseParams<K extends string>(
  query: ParsedUrlQuery,
  keys: readonly K[]
): ApiResponse<Record<K, string> & OptionalParams> {
  const allowed = new Set<string>([...keys, ...OPTIONAL_PARAMS]);
  const unknownKey = Object.keys(query).find(key => !allowed.has(key));
  if (unknownKey !== undefined) {
    return badRequest(`Unsupported parameter: ${unknownKey}`);
  }

  const params: Record<string, string> = {};
  for (const key of keys) {
    const value = query[key];
    if (typeof value !== 'string') {
      return badRequest(value === undefined ? `Missing parameter: ${key}` : `Repeated parameter: ${key}`);
    }

    if (ADDRESS_PARAMS.has(key)) {
      if (!isAddress(value)) {
        return badRequest(`Invalid address: ${key}`);
      }
    } else if (key === 'slippage') {
      if (!SLIPPAGE_REGEX.test(value) || Number(value) <= 0 || Number(value) > MAX_SLIPPAGE) {
        return badRequest(`Invalid slippage: must be > 0 and <= ${MAX_SLIPPAGE}`);
      }
    } else if (!AMOUNT_REGEX.test(value) || BigInt(value) > maxUint256) {
      return badRequest(`Invalid amount: ${key}`);
    }

    params[key] = value;
  }

  const { excludeRfq } = query;
  if (excludeRfq !== undefined) {
    if (excludeRfq !== 'true') {
      return badRequest('Invalid excludeRfq: must be true');
    }
    params.excludeRfq = excludeRfq;
  }

  const { excludeDexIds } = query;
  if (excludeDexIds !== undefined) {
    if (typeof excludeDexIds !== 'string' || !DEX_IDS_REGEX.test(excludeDexIds)) {
      return badRequest('Invalid excludeDexIds: must be a comma separated list of OKX dex ids');
    }
    params.excludeDexIds = excludeDexIds;
  }

  if (params.tokenIn.toLowerCase() === params.tokenOut.toLowerCase()) {
    return badRequest('tokenIn and tokenOut must differ');
  }

  return { code: 200, data: params as Record<K, string> & OptionalParams };
}

function parseOkxQuoteRequest(query: ParsedUrlQuery): ApiResponse<OkxQuoteRequest> {
  return parseParams(query, QUOTE_PARAMS);
}

function parseOkxSwapRequest(query: ParsedUrlQuery): ApiResponse<OkxSwapRequest> {
  return parseParams(query, SWAP_PARAMS);
}

/** Only tokens our crawler found swappable via OKX, so callers can't spend our rate limit on arbitrary pairs */
function isSupportedToken(chain: ApiChain, address: string): boolean {
  const supportByAddress = getTokenSwapSupport()[chain];
  if (!supportByAddress) {
    return false;
  }

  const lowerAddress = address.toLowerCase();
  return Object.entries(supportByAddress).some(
    ([tokenAddress, support]) =>
      !!support.okx && (tokenAddress === 'native' ? OKX_NATIVE_ADDRESS : tokenAddress.toLowerCase()) === lowerAddress
  );
}

function checkTokensSupported(request: OkxQuoteRequest, chain: ApiChain): ErrorApiResponse | undefined {
  for (const address of [request.tokenIn, request.tokenOut]) {
    if (!isSupportedToken(chain, address)) {
      return badRequest(`Unsupported token: ${address}`);
    }
  }
  return undefined;
}

function checkFromAddress(request: OkxSwapRequest, chain: ApiChain): ErrorApiResponse | undefined {
  const zapRouter = getZapRouter(chain);
  if (!zapRouter || zapRouter.toLowerCase() !== request.fromAddress.toLowerCase()) {
    return badRequest('fromAddress must be the zap router');
  }
  return undefined;
}

const getProxiedSwap = async (request: OkxSwapRequest, chain: ApiChain): Promise<ApiResponse<OkxSwapResponse>> => {
  try {
    const invalid = checkFromAddress(request, chain) || checkTokensSupported(request, chain);
    if (invalid) {
      return invalid;
    }

    const tooLowError = await isQuoteValueTooLow(request.amountIn, request.tokenIn, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getOkxApi(chain);
    return await api.getProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

const getProxiedQuote = async (
  request: OkxQuoteRequest,
  chain: ApiChain
): Promise<ApiResponse<OkxQuoteResponse, ExtraQuoteResponse>> => {
  try {
    const unsupported = checkTokensSupported(request, chain);
    if (unsupported) {
      return unsupported;
    }

    const tooLowError = await isQuoteValueTooLow(request.amountIn, request.tokenIn, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getOkxApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

export const proxyOkxSwap = withChainId(async (ctx, chain) => {
  // Own bucket, so quoting can't block building a swap that already won
  if (isRateLimited(ctx, 'okx-swap')) {
    return setRateLimitedResponse(ctx);
  }
  const start = Date.now();
  const request = parseOkxSwapRequest(ctx.query);
  const proxiedSwap = isSuccessApiResponse(request) ? await getProxiedSwap(request.data, chain) : request;
  if (isSuccessApiResponse(proxiedSwap)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied swap');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
});

export const proxyOkxQuote = withChainId(async (ctx, chain) => {
  if (isRateLimited(ctx, 'okx')) {
    return setRateLimitedResponse(ctx);
  }
  const start = Date.now();
  const request = parseOkxQuoteRequest(ctx.query);
  const proxiedQuote = isSuccessApiResponse(request) ? await getProxiedQuote(request.data, chain) : request;
  if (isSuccessApiResponse(proxiedQuote)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied quote');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedQuote.code;
  ctx.body = isSuccessApiResponse(proxiedQuote)
    ? { ...proxiedQuote.data, extra: proxiedQuote.extra }
    : proxiedQuote.message;
});
