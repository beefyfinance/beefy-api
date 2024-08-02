export function getUnixNow() {
  return Math.trunc(Date.now() / 1000);
}

export function isUnixBetween(start: number, end: number, now?: number) {
  now = now || getUnixNow();
  return start <= now && now < end;
}
