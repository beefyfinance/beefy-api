import { sleep } from './time';
import { ABORT_REASON_TIMEOUT } from './http/helpers';
import { chunk } from 'lodash';
import NodeCache from 'node-cache';
import AsyncLock from 'async-lock';

export type DeferredPromise<T> = Promise<T> & {
  resolve: (value: T) => void;
  reject: (error: any) => void;
};

export function deferred<T>(): DeferredPromise<T> {
  let resolve: (value: T) => void;
  let reject: (error: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  }) as DeferredPromise<T>;

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}

export function withTimeout<T>(promise: Promise<T>, timeout: number, message?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(`Promise timed out after ${(timeout / 1000).toFixed(1)}s${message ? `: ${message}` : ''}`)
      );
    }, timeout);
    promise.then(
      value => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      error => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export const retryPromiseWithBackOff = async <T>(
  f: (...args: any[]) => Promise<T>,
  args: any[] | undefined,
  label: string,
  nthTry = 1,
  delayTime: number = 200,
  maxTries: number = 5
): Promise<T> => {
  try {
    return args ? await f(...args) : await f();
  } catch (e) {
    if (nthTry > maxTries) {
      return Promise.reject(e);
    }
    console.log(`retrying [${label}]: ${nthTry}/${maxTries}, awaiting ${2 ** (nthTry + 1) * delayTime}`);

    await sleep(2 ** (nthTry + 1) * delayTime);
    return retryPromiseWithBackOff(f, args, label, nthTry + 1, delayTime, maxTries);
  }
};

export function isResultFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isResultRejected<T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

export type PromiseContextFulfilledResult<TContext, TResult> = PromiseFulfilledResult<TResult> & {
  context: TContext;
  elapsed: number;
};
export type PromiseContextRejectedResult<TContext> = PromiseRejectedResult & {
  context: TContext;
  elapsed: number;
};
export type PromiseContextResult<TContext, TResult> =
  | PromiseContextFulfilledResult<TContext, TResult>
  | PromiseContextRejectedResult<TContext>;

export function contextAllSettled<TContext, TResult>(
  contexts: TContext[],
  mapper: (context: TContext) => Promise<TResult>
): Promise<Array<PromiseContextResult<TContext, TResult>>> {
  return Promise.all(
    contexts.map(async context => {
      const start = Date.now();
      try {
        const value = await mapper(context);
        return { status: 'fulfilled', value, context, elapsed: Date.now() - start };
      } catch (reason) {
        return { status: 'rejected', reason, context, elapsed: Date.now() - start };
      }
    })
  );
}

export function isContextResultFulfilled<TContext, TResult>(
  result: PromiseContextResult<TContext, TResult>
): result is PromiseContextFulfilledResult<TContext, TResult> {
  return result.status === 'fulfilled';
}

export function isContextResultRejected<TContext, TResult>(
  result: PromiseContextResult<TContext, TResult>
): result is PromiseContextRejectedResult<TContext> {
  return result.status === 'rejected';
}

export function getTimeoutAbortSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(ABORT_REASON_TIMEOUT), timeout);
  return controller.signal;
}

type BatchMapParams<T, R> = {
  items: T[];
  batchSize: number;
  handleFn: (batchItems: T[]) => Promise<R[]>;
  retryDelay?: number;
  retryLimit?: number;
  retryLabel: string;
};

export async function batchMapRetry<T, R>({
  items,
  batchSize,
  handleFn,
  retryLabel,
  retryDelay = 200,
  retryLimit = 5,
}: BatchMapParams<T, R>): Promise<PromiseContextResult<T, R>[]> {
  const batches = chunk(items, batchSize);
  const batchResults = await contextAllSettled(batches, async batchItems =>
    retryPromiseWithBackOff(handleFn, [batchItems], retryLabel, 1, retryDelay, retryLimit)
  );
  return batchResults.flatMap((results): PromiseContextResult<T, R>[] => {
    if (isContextResultFulfilled(results)) {
      return results.value.map((result, i) => ({
        value: result,
        context: results.context[i],
        elapsed: results.elapsed,
        status: results.status,
      }));
    }

    return results.context.map((context, i) => ({
      context: context,
      elapsed: results.elapsed,
      status: results.status,
      reason: results.reason,
    }));
  });
}

type AsyncCacheOptions = {
  ttl: number; // time to live in seconds
  checkPeriod?: number; // time in seconds to check for expired keys, defaults to ttl * 3
};

/** in-memory ttl cache with async locking by key */
export class AsyncCache {
  private readonly cache: NodeCache;
  private readonly lock: AsyncLock;

  constructor({ ttl, checkPeriod = ttl * 3 }: AsyncCacheOptions) {
    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: checkPeriod,
      useClones: false,
      deleteOnExpire: true,
    });
    this.lock = new AsyncLock();
  }

  async get<TKey extends string, TValue>(key: TKey, fetchFn: () => Promise<TValue>): Promise<TValue> {
    return this.lock.acquire(key, async () => {
      const cached = this.cache.get<TValue>(key);
      if (cached !== undefined) {
        return cached;
      }
      const value = await fetchFn();
      this.cache.set(key, value);
      return value;
    });
  }

  static wrap<TKey extends string, TValue>(
    fn: (key: TKey) => Promise<TValue>,
    options: AsyncCacheOptions
  ): (key: TKey) => Promise<TValue> {
    const asyncCache = new AsyncCache(options);
    return (key: TKey) => asyncCache.get(key, () => fn(key));
  }

  static wrapWithKeyBuilder<TValue, TArgs extends any[]>(
    fetchFn: (...args: TArgs) => Promise<TValue>,
    keyFn: (...args: TArgs) => string,
    options: AsyncCacheOptions
  ): (...args: TArgs) => Promise<TValue> {
    const asyncCache = new AsyncCache(options);
    return (...args: TArgs) => {
      const key = keyFn(...args);
      return asyncCache.get<string, TValue>(key, () => fetchFn(...args));
    };
  }
}
