import { describe, expect, it } from 'vitest';
import { twapTick } from './helpers.ts';

describe('twapTick', () => {
  it('divides the tick cumulative delta by the window', () => {
    expect(twapTick([0n, 1200n], 120, 'truncate')).toBe(10);
    expect(twapTick([0n, 1210n], 120, 'floor')).toBe(10);
    expect(twapTick([0n, -1200n], 120, 'floor')).toBe(-10);
  });

  it('truncates or floors a negative remainder', () => {
    expect(twapTick([0n, -1210n], 120, 'truncate')).toBe(-10);
    expect(twapTick([0n, -1210n], 120, 'floor')).toBe(-11);
  });
});
