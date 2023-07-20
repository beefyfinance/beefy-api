import { sleep } from './time';

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

export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Promise timed out')), timeout);
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
  args: any[],
  label: string,
  nthTry = 1,
  delayTime: number = 200,
  maxTries: number = 5
): Promise<T> => {
  try {
    const res = args ? await f(args) : await f();
    return res;
  } catch (e) {
    if (nthTry > maxTries) {
      return Promise.reject(e);
    }
    console.log(
      `retrying [${label}]: ${nthTry}/${maxTries}, awaiting ${2 ** (nthTry + 1) * delayTime}`
    );

    await sleep(2 ** (nthTry + 1) * delayTime);
    return retryPromiseWithBackOff(f, args, label, nthTry + 1, delayTime, maxTries);
  }
};

export function isResultFulfilled<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isResultRejected<T>(
  result: PromiseSettledResult<T>
): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

export function onlyFulfilledValues<T>(results: PromiseSettledResult<T>[]): T[] {
  return results.filter(isResultFulfilled).map(result => result.value);
}

export function onlyRejectedReasons<T>(results: PromiseSettledResult<T>[]): any[] {
  return results.filter(isResultRejected).map(result => result.reason);
}
