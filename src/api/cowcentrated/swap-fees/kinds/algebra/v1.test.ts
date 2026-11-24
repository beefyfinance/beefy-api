import { describe, expect, it } from 'vitest';
import { integralDefaults } from '../../test/fee-params.ts';
import { algebraV1Range } from './v1.ts';

describe('algebraV1Range', () => {
  it('scales the zero volatility fee by the volume sigmoid', () => {
    const config = { ...integralDefaults, gamma1: 100, gamma2: 20_000, volumeBeta: 0, volumeGamma: 10 };
    expect(algebraV1Range(config)).toStrictEqual({ min: 100 + 323, max: 15_000 });
    expect(algebraV1Range({ ...config, volumeBeta: 1000 })).toStrictEqual({ min: 100, max: 15_000 });
  });

  it('caps the max at 65535', () => {
    const config = { ...integralDefaults, alpha1: 60_000, alpha2: 60_000, volumeBeta: 0, volumeGamma: 10 };
    expect(algebraV1Range(config)).toMatchObject({ max: 65_535 });
  });
});
