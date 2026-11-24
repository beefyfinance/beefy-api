import { describe, expect, it } from 'vitest';
import { fixedFee } from '../../fee.ts';
import { volatilityParams as params, volatileConfig as volatile, ZERO_FEE_INDICATOR } from '../../test/fee-params.ts';
import { aeroHookFee } from './aero.ts';

describe('aeroHookFee', () => {
  it('charges the tick spacing fee when the base fee is the zero fee indicator', () => {
    expect(aeroHookFee(params({ baseFee: ZERO_FEE_INDICATOR }))).toStrictEqual(fixedFee(500));
  });

  it('adds the volatility part, bounded by the cap', () => {
    expect(aeroHookFee(params(volatile))).toStrictEqual({ current: 0.0014, dynamic: true, min: 0.0004, max: 0.01 });
  });

  it('clamps to the 10% ceiling', () => {
    const fee = aeroHookFee(params({ baseFee: 90_000, feeCap: 200_000, scalingFactor: 1_000_000_000n }));
    expect(fee).toStrictEqual({ current: 0.1, dynamic: true, min: 0.09, max: 0.1 });
  });

  it('charges the tick spacing fee instead of a zero fee', () => {
    expect(aeroHookFee(params({ baseFee: 400, feeCap: 0, scalingFactor: 1n }))).toStrictEqual(fixedFee(500));
  });

  describe('initial fee', () => {
    it('defaults to the base fee', () => {
      expect(aeroHookFee(params({ ...volatile, initialFeeEnabled: true, initialFee: 0 }))).toMatchObject({
        firstSwap: 0.0004,
      });
    });

    it('is the tick spacing fee for the zero fee indicator', () => {
      const fee = aeroHookFee(params({ ...volatile, initialFeeEnabled: true, initialFee: ZERO_FEE_INDICATOR }));
      expect(fee).toMatchObject({ firstSwap: 0.0005 });
    });

    it('is clamped to the 10% ceiling', () => {
      expect(aeroHookFee(params({ ...volatile, initialFeeEnabled: true, initialFee: 150_000 }))).toMatchObject({
        firstSwap: 0.1,
      });
    });
  });
});
