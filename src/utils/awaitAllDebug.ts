export async function awaitAllDebug<T>(
  promises: Iterable<T | PromiseLike<T>>,
  names: string[]
): Promise<Awaited<T>[]> {
  const toResolve = Array.from(promises).map(
    (p, i) =>
      new Promise<{ value: unknown; index: number; name: string }>((resolve, reject) => {
        Promise.resolve(p)
          .then(v => {
            console.log(`>> ${names[i]} resolved`);
            resolve({ value: v, index: i, name: names[i] || `#${i}` });
          })
          .catch(e => {
            console.log(`>> ${names[i]} failed`);
            reject({ error: e, index: i, name: names[i] || `#${i}` });
          });
      })
  );
  const resolved = new Array<Awaited<T>>(toResolve.length);
  let numToResolve = toResolve.length;

  while (numToResolve > 0) {
    try {
      console.log(
        `>> left: ${toResolve
          .map((p, i) => (p ? names[i] : undefined))
          .filter(p => p)
          .join(', ')}`
      );
      const next = await Promise.race(toResolve.filter(p => p !== undefined));
      delete toResolve[next.index];
      --numToResolve;
      resolved[next.index] = next.value as Awaited<T>;
    } catch (e: any) {
      throw e.error;
    }
  }

  console.log('>>> all resolved', names.join(', '));

  return resolved;
}
