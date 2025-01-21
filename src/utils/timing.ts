import { toNumber } from './number';

const ENABLE_TIMING = process.env.TIMING_ENABLED === 'true' || false;
const MIN_TIME_MS = toNumber(parseInt(process.env.TIMING_MIN || '30000'), 30_000);

export function startTimer() {
  const start = performance.now();
  return (messageFn: (elapsed: number) => string) => {
    const elapsed = performance.now() - start;
    if (elapsed >= MIN_TIME_MS) {
      console.log(`[Timing]: ${messageFn(elapsed)}`);
    }
  };
}

/** Creates a new function with timing */
export function timing<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string,
  enabled: boolean = ENABLE_TIMING
): T {
  if (!enabled) {
    return fn;
  }

  return (async (...args: any[]) => {
    const timer = startTimer();
    const result = await fn(...args);
    timer(elapsed => `${name} took ${elapsed}ms`);
    return result;
  }) as T;
}

/** Wraps a promise with timing */
export function promiseTiming<T>(promise: Promise<T>, name: string, enabled: boolean = ENABLE_TIMING) {
  if (!enabled) {
    return promise;
  }

  const timer = startTimer();
  return promise.finally(() => {
    timer(elapsed => `${name} took ${elapsed}ms`);
  });
}

export function promiseArrayTiming<T>(
  promises: Promise<T>[],
  nameFn: (index: number) => string,
  enabled: boolean = ENABLE_TIMING
) {
  if (!enabled) {
    return promises;
  }

  const timer = startTimer();
  return promises.map((promise, index) => {
    const name = nameFn(index);
    return promise.finally(() => {
      timer(elapsed => `${name} took ${elapsed}ms`);
    });
  });
}
