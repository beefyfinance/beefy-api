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
  isSuccessApiResponse,
} from '../api/common.ts';
import { getEnsoApi, getZapRouter } from '../api/enso/index.ts';
import {
  ENSO_NATIVE_ADDRESS,
  type EnsoQuoteRequest,
  type EnsoQuoteResponse,
  type EnsoSwapRequest,
  type EnsoSwapResponse,
} from '../api/enso/types.ts';
import { getTokenSwapSupport } from '../swap/index.ts';
import { isQuoteValueTooLow, setNoCacheHeaders } from './common.ts';

const logger = getLoggerFor({ module: 'zap', component: 'enso' });

const QUOTE_PARAMS = ['tokenIn', 'tokenOut', 'amountIn'] as const;
const SWAP_PARAMS = [...QUOTE_PARAMS, 'fromAddress', 'minAmountOut'] as const;
const ADDRESS_PARAMS = new Set<string>(['tokenIn', 'tokenOut', 'fromAddress']);
const AMOUNT_REGEX = /^[1-9]\d{0,77}$/;

function badRequest(message: string): ErrorApiResponse {
  return { code: 400, message };
}

/**
 * Only forward known params, so callers can't use our key for anything else (e.g. adding a fee)
 */
function parseParams<K extends string>(query: ParsedUrlQuery, keys: readonly K[]): ApiResponse<Record<K, string>> {
  const allowed = new Set<string>(keys);
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
    } else if (!AMOUNT_REGEX.test(value) || BigInt(value) > maxUint256) {
      return badRequest(`Invalid amount: ${key}`);
    }

    params[key] = value;
  }

  if (params.tokenIn.toLowerCase() === params.tokenOut.toLowerCase()) {
    return badRequest('tokenIn and tokenOut must differ');
  }

  return { code: 200, data: params as Record<K, string> };
}

function parseEnsoQuoteRequest(query: ParsedUrlQuery): ApiResponse<EnsoQuoteRequest> {
  return parseParams(query, QUOTE_PARAMS);
}

function parseEnsoSwapRequest(query: ParsedUrlQuery): ApiResponse<EnsoSwapRequest> {
  return parseParams(query, SWAP_PARAMS);
}

/** Only tokens our crawler found swappable via Enso, so callers can't spend credits on arbitrary pairs */
function isSupportedToken(chain: ApiChain, address: string): boolean {
  const supportByAddress = getTokenSwapSupport()[chain];
  if (!supportByAddress) {
    return false;
  }

  const lowerAddress = address.toLowerCase();
  return Object.entries(supportByAddress).some(
    ([tokenAddress, support]) =>
      !!support.enso && (tokenAddress === 'native' ? ENSO_NATIVE_ADDRESS : tokenAddress.toLowerCase()) === lowerAddress
  );
}

function checkTokensSupported(request: EnsoQuoteRequest, chain: ApiChain): ErrorApiResponse | undefined {
  for (const address of [request.tokenIn, request.tokenOut]) {
    if (!isSupportedToken(chain, address)) {
      return badRequest(`Unsupported token: ${address}`);
    }
  }
  return undefined;
}

function checkFromAddress(request: EnsoSwapRequest, chain: ApiChain): ErrorApiResponse | undefined {
  const zapRouter = getZapRouter(chain);
  if (!zapRouter || zapRouter.toLowerCase() !== request.fromAddress.toLowerCase()) {
    return badRequest('fromAddress must be the zap router');
  }
  return undefined;
}

const getProxiedSwap = async (request: EnsoSwapRequest, chain: ApiChain): Promise<ApiResponse<EnsoSwapResponse>> => {
  try {
    const invalid = checkFromAddress(request, chain) || checkTokensSupported(request, chain);
    if (invalid) {
      return invalid;
    }

    const tooLowError = await isQuoteValueTooLow(request.amountIn, request.tokenIn, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getEnsoApi(chain);
    return await api.getProxiedSwap(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

const getProxiedQuote = async (
  request: EnsoQuoteRequest,
  chain: ApiChain
): Promise<ApiResponse<EnsoQuoteResponse, ExtraQuoteResponse>> => {
  try {
    const unsupported = checkTokensSupported(request, chain);
    if (unsupported) {
      return unsupported;
    }

    const tooLowError = await isQuoteValueTooLow(request.amountIn, request.tokenIn, chain);
    if (tooLowError) {
      return tooLowError;
    }

    const api = getEnsoApi(chain);
    return await api.getProxiedQuote(request);
  } catch (err) {
    return {
      code: 500,
      message: redactSecrets(errorToString(err)),
    };
  }
};

export const proxyEnsoSwap = withChainId(async (ctx, chain) => {
  const start = Date.now();
  const request = parseEnsoSwapRequest(ctx.query);
  const proxiedSwap = isSuccessApiResponse(request) ? await getProxiedSwap(request.data, chain) : request;
  if (isSuccessApiResponse(proxiedSwap)) {
    logger.debug({ chain, durationMs: Date.now() - start }, 'proxied swap');
  }
  setNoCacheHeaders(ctx);
  ctx.status = proxiedSwap.code;
  ctx.body = isSuccessApiResponse(proxiedSwap) ? proxiedSwap.data : proxiedSwap.message;
});

export const proxyEnsoQuote = withChainId(async (ctx, chain) => {
  const start = Date.now();
  const request = parseEnsoQuoteRequest(ctx.query);
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
