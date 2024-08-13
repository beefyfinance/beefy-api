import type {
  FetchCommonJsonRequest,
  FetchGetJsonRequest,
  FetchPostJsonRequest,
  FetchRequestInit,
} from './types';
import {
  ABORT_REASON_TIMEOUT,
  getCacheBuster,
  getUrlSearchParams,
  isPassThroughBodyInit,
  isPassThroughURLSearchParamsInit,
  setAcceptsAnyIfMissing,
  setAcceptsJsonIfMissing,
  setContentTypeJsonIfMissing,
} from './helpers';
import {
  FetchAbortError,
  FetchError,
  FetchResponseBodyTextError,
  FetchResponseDecodeError,
  FetchResponseError,
  FetchResponseJsonParseError,
  FetchResponseNotJsonError,
  FetchTimeoutError,
  isFetchError,
} from './errors';
import { isError } from '../error';
import { getTimeoutAbortSignal } from '../promise';

/** response decoded as JSON */
export async function getJson<TResponse>(request: FetchGetJsonRequest): Promise<TResponse> {
  const { url, init } = getRequestUrlInit(request);
  setAcceptsJsonIfMissing(init.headers);
  return fetchResponseBody<TResponse>(url, { ...init, method: 'GET' }, decodeJson);
}

/** body sent as JSON, response decoded as JSON */
export async function postJson<TResponse>(request: FetchPostJsonRequest): Promise<TResponse> {
  const body = isPassThroughBodyInit(request.body) ? request.body : JSON.stringify(request.body);
  const { url, init } = getRequestUrlInit(request);
  setAcceptsJsonIfMissing(init.headers);
  setContentTypeJsonIfMissing(init.headers);
  return fetchResponseBody<TResponse>(url, { ...init, method: 'POST', body }, decodeJson);
}

/** response decoded as text */
export async function getText(request: FetchGetJsonRequest): Promise<string> {
  const { url, init } = getRequestUrlInit(request);
  setAcceptsAnyIfMissing(init.headers);
  return fetchResponseBody<string>(url, { ...init, method: 'GET' }, decodeText);
}

/** body sent as JSON, response decoded as text */
export async function postText(request: FetchPostJsonRequest): Promise<string> {
  const body = isPassThroughBodyInit(request.body) ? request.body : JSON.stringify(request.body);
  const { url, init } = getRequestUrlInit(request);
  setAcceptsAnyIfMissing(init.headers);
  setContentTypeJsonIfMissing(init.headers);
  return fetchResponseBody<string>(url, { ...init, method: 'POST', body }, decodeText);
}

type FetchRequestUrlInit = { url: string; init: FetchRequestInit };

function getRequestUrlInit(request: FetchCommonJsonRequest): FetchRequestUrlInit {
  const signal: AbortSignal | undefined =
    'signal' in request && request.signal
      ? request.signal
      : 'timeout' in request && request.timeout
      ? getTimeoutAbortSignal(request.timeout)
      : undefined;

  const headers = request.headers ? new Headers(request.headers) : new Headers();

  const params = request.params
    ? isPassThroughURLSearchParamsInit(request.params)
      ? new URLSearchParams(request.params)
      : getUrlSearchParams(request.params, request.paramsOptions)
    : new URLSearchParams();
  if (request.cacheBuster) {
    params.set('_', getCacheBuster(request.cacheBuster));
  }

  const url = `${request.url}${params.size ? `?${params}` : ''}`;
  return {
    url,
    init: {
      headers,
      signal,
      ...(request.init || {}),
    },
  };
}

async function decodeJson<TResponse>(res: Response): Promise<TResponse> {
  if (!res.headers.get('Content-Type')?.includes('application/json')) {
    throw new FetchResponseNotJsonError(res);
  }

  try {
    return (await res.json()) as TResponse;
  } catch (err: unknown) {
    if (isError(err) && !isFetchError(err)) {
      if (err.name === 'SyntaxError') {
        throw new FetchResponseJsonParseError(res, err);
      } else {
        throw new FetchResponseError(res, err.message, err);
      }
    }
    throw err;
  }
}

async function decodeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch (err: unknown) {
    if (isError(err) && !isFetchError(err)) {
      throw new FetchResponseBodyTextError(res, err);
    }
    throw err;
  }
}

async function fetchResponseBody<T>(
  url: string,
  init: FetchRequestInit,
  decoder: (res: Response) => Promise<T>
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err: unknown) {
    if (isError(err)) {
      if (err.name === 'TimeoutError') {
        throw new FetchTimeoutError(err);
      } else if (err.name === 'AbortError') {
        if (init.signal?.aborted && init.signal.reason === ABORT_REASON_TIMEOUT) {
          throw new FetchTimeoutError(err);
        }
        throw new FetchAbortError(err);
      } else {
        throw new FetchError(err.message, err);
      }
    }
    throw err;
  }

  if (!res.ok) {
    throw new FetchResponseError(res);
  }

  try {
    return await decoder(res);
  } catch (err: unknown) {
    if (isError(err) && !isFetchError(err)) {
      throw new FetchResponseDecodeError(res, err);
    }
    throw err;
  }
}
