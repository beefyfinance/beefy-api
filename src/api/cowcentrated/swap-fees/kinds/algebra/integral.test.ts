import { describe, expect, it } from 'vitest';
import { integralDefaults } from '../../test/fee-params.ts';
import { algebraIntegralRange, isAlgebraIntegralFeeActive } from './integral.ts';

describe('algebraIntegralRange', () => {
  it('is the base fee when both sigmoids are 0 at zero volatility', () => {
    expect(algebraIntegralRange(integralDefaults)).toStrictEqual({ min: 100, max: 15_000 });
  });

  it('includes the sigmoids at zero volatility', () => {
    expect(algebraIntegralRange({ ...integralDefaults, gamma1: 100, gamma2: 20_000 })).toStrictEqual({
      min: 100 + 77 + 569,
      max: 15_000,
    });
  });

  it('caps the max at 65535', () => {
    expect(algebraIntegralRange({ ...integralDefaults, alpha1: 60_000, alpha2: 60_000 })).toMatchObject({
      max: 65_535,
    });
  });
});

describe('isAlgebraIntegralFeeActive', () => {
  it('needs both the before-swap and dynamic fee flags', () => {
    expect(isAlgebraIntegralFeeActive(0x81)).toBe(true);
    expect(isAlgebraIntegralFeeActive(0xff)).toBe(true);
    expect(isAlgebraIntegralFeeActive(0x01)).toBe(false);
    expect(isAlgebraIntegralFeeActive(0x80)).toBe(false);
  });
});
