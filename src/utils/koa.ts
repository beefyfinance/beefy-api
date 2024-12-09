import { Context } from 'koa';

const DEFAULT_RETRY_AFTER: number = 60; // seconds

export type CacheOptions = {
  control?: 'no-cache' | 'no-store' | 'public' | 'private';
  maxAge?: number;
  sharedMaxAge?: number;
  staleIfError?: number;
  staleWhileRevalidate?: number;
};

function sendStatusCode(ctx: Context, statusCode: number, body?: unknown, cache?: CacheOptions) {
  ctx.status = statusCode;
  if (body) {
    ctx.body = body;
  }
  if (cache) {
    const parts: string[] = [];
    if (cache.control !== undefined) {
      parts.push(cache.control);
    }
    if (cache.maxAge !== undefined) {
      parts.push(`max-age=${cache.maxAge}`);
    }
    if (cache.sharedMaxAge !== undefined) {
      parts.push(`s-maxage=${cache.sharedMaxAge}`);
    }
    if (cache.staleIfError !== undefined) {
      parts.push(`stale-if-error=${cache.staleIfError}`);
    }
    if (cache.staleWhileRevalidate !== undefined) {
      parts.push(`stale-while-revalidate=${cache.staleWhileRevalidate}`);
    }
    ctx.set('Cache-Control', parts.join(', '));
  }
}

export function sendSuccess(ctx: Context, body?: unknown, cache?: CacheOptions) {
  sendStatusCode(ctx, 200, body, cache);
}

export function sendBadRequest(ctx: Context, body?: unknown, cache?: CacheOptions) {
  sendStatusCode(ctx, 400, body, cache);
}

export function sendNotFound(ctx: Context, body?: unknown, cache?: CacheOptions) {
  sendStatusCode(ctx, 404, body, cache);
}

export function sendInternalServerError(ctx: Context, body?: unknown, cache?: CacheOptions) {
  sendStatusCode(ctx, 500, body, cache);
}

export function sendServiceUnavailable(
  ctx: Context,
  body?: unknown,
  retryAfter: number = DEFAULT_RETRY_AFTER
) {
  sendStatusCode(ctx, 503, body, {
    control: 'no-cache',
    maxAge: retryAfter,
    sharedMaxAge: retryAfter,
  });
  ctx.headers['Retry-After'] = `${DEFAULT_RETRY_AFTER}`;
  ctx.headers['Cache-Control'] = `s-maxage=${DEFAULT_RETRY_AFTER}`;
}

export type KoaCallback = (ctx: Context) => Promise<void>;

export function withErrorHandling(cb: KoaCallback): KoaCallback {
  return async (ctx: Context) => {
    try {
      await cb(ctx);
    } catch (error) {
      console.error(error);
      sendInternalServerError(ctx);
    }
  };
}
