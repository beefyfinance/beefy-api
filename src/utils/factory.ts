type FactoryFn<P, R> = (...props: P[]) => R;

export function createFactory<P, R>(factoryFn: FactoryFn<P, R>): FactoryFn<P, R> {
  let cache: R | undefined;
  return (...args: P[]): R => {
    if (cache === undefined) {
      cache = factoryFn(...args);
    }
    return cache;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCachedFactory<FN extends (...args: any[]) => any>(
  factoryFn: FN,
  keyFn: (...args: Parameters<FN>) => string = (...args) => JSON.stringify(args)
) {
  const cache: { [index: string]: ReturnType<FN> } = {};
  return (...args: Parameters<FN>) => {
    const index = keyFn(...args);
    let value = cache[index];
    if (value === undefined) {
      value = cache[index] = factoryFn(...args);
    }
    return value;
  };
}
