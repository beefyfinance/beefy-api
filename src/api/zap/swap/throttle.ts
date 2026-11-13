import type { TokenSupportByAddress } from './types.ts';

export function isUpdateDue(lastStart: number | undefined, minDelay: number | undefined, now: number): boolean {
  return minDelay === undefined || lastStart === undefined || now - lastStart >= minDelay;
}

/** Newest updatedAt among supported tokens, or undefined if none are supported */
export function getLastSupportedUpdate(supportByAddress: TokenSupportByAddress): number | undefined {
  let last: number | undefined;
  for (const support of Object.values(supportByAddress)) {
    if (support.supported && (last === undefined || support.updatedAt > last)) {
      last = support.updatedAt;
    }
  }
  return last;
}
