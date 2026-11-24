import { describe, expect, it } from 'vitest';
import { fixedFee } from '../../fee.ts';
import { algebraFee } from './helpers.ts';

describe('algebraFee', () => {
  it('spans the widest range', () => {
    expect(
      algebraFee(300, [
        { min: 100, max: 15_000 },
        { min: 200, max: 3000 },
      ])
    ).toStrictEqual({ current: 0.0003, dynamic: true, min: 0.0001, max: 0.015 });
  });

  it('is fixed when the range is a single value', () => {
    expect(algebraFee(300, [{ min: 300, max: 300 }])).toStrictEqual(fixedFee(300));
  });
});
