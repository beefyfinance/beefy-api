import { describe, expect, it } from 'vitest';
import { fixedFee } from '../../fee.ts';
import { volatilityParams as params, volatileConfig as volatile, ZERO_FEE_INDICATOR } from '../../test/fee-params.ts';
import { slipstreamModuleFee } from './slipstream.ts';

describe('slipstreamModuleFee', () => {
  it('charges nothing when the base fee is the zero fee indicator', () => {
    expect(slipstreamModuleFee(params({ baseFee: ZERO_FEE_INDICATOR }))).toStrictEqual(fixedFee(0));
  });

  it('uses the tick spacing fee for a zero base fee and is fixed without a scaling factor', () => {
    expect(slipstreamModuleFee(params({}, { zeroFeeIndicator: undefined }))).toStrictEqual(fixedFee(500));
  });

  it('adds the volatility part, bounded by the cap', () => {
    expect(slipstreamModuleFee(params(volatile))).toStrictEqual({
      current: 0.0014,
      dynamic: true,
      min: 0.0004,
      max: 0.01,
    });
  });

  it('charges the base fee when the twap is unavailable', () => {
    expect(slipstreamModuleFee(params(volatile, { twapTick: undefined }))).toMatchObject({ current: 0.0004 });
  });

  it('falls back to the default scaling factor and cap when the scaling factor is zero', () => {
    const fee = slipstreamModuleFee(
      params({ baseFee: 400, feeCap: 99_999 }, { defaultScalingFactor: 5_000_000n, defaultFeeCap: 3000 })
    );
    expect(fee).toStrictEqual({ current: 0.0009, dynamic: true, min: 0.0004, max: 0.003 });
  });

  it('replaces a fee above 10% with the tick spacing fee, so the max is 10%', () => {
    const fee = slipstreamModuleFee(params({ baseFee: 90_000, feeCap: 200_000, scalingFactor: 1_000_000_000n }));
    expect(fee).toStrictEqual({ current: 0.0005, dynamic: true, min: 0.09, max: 0.1 });
  });

  it('replaces a min above 10% with the tick spacing fee', () => {
    const fee = slipstreamModuleFee(params({ baseFee: 150_000, feeCap: 300_000, scalingFactor: 1n }));
    expect(fee).toStrictEqual({ current: 0.0005, dynamic: true, min: 0.0005, max: 0.1 });
  });

  describe('initial fee', () => {
    it('is omitted when disabled or not supported', () => {
      expect(
        slipstreamModuleFee(params({ ...volatile, initialFeeEnabled: false, initialFee: 5000 }))
      ).not.toHaveProperty('firstSwap');
      expect(slipstreamModuleFee(params(volatile))).not.toHaveProperty('firstSwap');
    });

    it('defaults to the base fee', () => {
      expect(slipstreamModuleFee(params({ ...volatile, initialFeeEnabled: true, initialFee: 0 }))).toMatchObject({
        firstSwap: 0.0004,
      });
    });

    it('is omitted when it equals the current fee', () => {
      const fee = slipstreamModuleFee(
        params({ ...volatile, initialFeeEnabled: true, initialFee: 0 }, { twapTick: undefined })
      );
      expect(fee).not.toHaveProperty('firstSwap');
    });

    it('is zero for the zero fee indicator', () => {
      const fee = slipstreamModuleFee(params({ ...volatile, initialFeeEnabled: true, initialFee: ZERO_FEE_INDICATOR }));
      expect(fee).toMatchObject({ firstSwap: 0 });
    });

    it('is not capped, but above 10% falls back to the tick spacing fee', () => {
      expect(slipstreamModuleFee(params({ ...volatile, initialFeeEnabled: true, initialFee: 50_000 }))).toMatchObject({
        firstSwap: 0.05,
      });
      expect(slipstreamModuleFee(params({ ...volatile, initialFeeEnabled: true, initialFee: 120_000 }))).toMatchObject({
        firstSwap: 0.0005,
      });
    });
  });
});
