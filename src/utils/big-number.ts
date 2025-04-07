import BigNumber from 'bignumber.js';

/** Any type that can be passed to our toBigNumber function */
export type BigNumberish = BigNumber.Value | bigint;

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);
export const BIG_UNIT_18 = BIG_ONE.shiftedBy(18);
export const BIG_MAX_UINT256 = new BigNumber(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
);

export function isBigNumberish(value: any): value is BigNumberish {
  return (
    typeof value === 'number' || typeof value === 'string' || typeof value === 'bigint' || isBigNumber(value)
  );
}

export function toBigNumber(input: BigNumberish): BigNumber {
  if (BigNumber.isBigNumber(input)) {
    return input;
  }

  return new BigNumber(typeof input === 'bigint' ? input.toString() : input);
}

export function isBigNumber(value: any): value is BigNumber {
  return BigNumber.isBigNumber(value);
}

export function isFiniteBigNumber(value: any): value is BigNumber {
  return value !== null && isBigNumber(value) && !value.isNaN() && value.isFinite();
}

export function toWei(value: BigNumber, decimals: number): BigNumber {
  return value.shiftedBy(decimals).decimalPlaces(0, BigNumber.ROUND_FLOOR);
}

export function toWeiString(value: BigNumber, decimals: number): string {
  return toWei(value, decimals).toString(10);
}

export function fromWei(value: BigNumber, decimals: number): BigNumber {
  return value.shiftedBy(-decimals).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);
}

export function fromWeiString(value: string, decimals: number): BigNumber {
  return fromWei(new BigNumber(value), decimals);
}
