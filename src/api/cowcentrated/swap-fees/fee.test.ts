import { describe, expect, it } from 'vitest';
import { fixedFee, managedFee, rangedFee } from './fee.ts';

describe('fee', () => {
  it('converts pips to a fraction', () => {
    expect(fixedFee(3000)).toStrictEqual({ current: 0.003, dynamic: false });
    expect(managedFee(3000)).toStrictEqual({ current: 0.003, dynamic: true });
  });

  it('is dynamic between distinct bounds', () => {
    expect(rangedFee(300, 100, 500)).toStrictEqual({ current: 0.0003, dynamic: true, min: 0.0001, max: 0.0005 });
    expect(rangedFee(300, 300, 300)).toStrictEqual(fixedFee(300));
  });

  it('includes a first swap fee that differs from the current fee', () => {
    expect(rangedFee(300, 100, 500, 200)).toMatchObject({ firstSwap: 0.0002 });
    expect(rangedFee(300, 100, 500, 300)).not.toHaveProperty('firstSwap');
  });
});
