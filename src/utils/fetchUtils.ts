export function createTimeoutSignal(ms: number) {
  let controller = new AbortController();

  setTimeout(() => {
    controller.abort();
    controller = null;
  }, ms);

  return controller.signal;
}
