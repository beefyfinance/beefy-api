/** Swap fee of a CLM's underlying pool, as fractions (0.003 = 0.3%) */
export type ClmSwapFee = {
  /** fee a typical swap pays now */
  current: number;
  /** whether the fee moves without a config change (volatility based, or set by an off-chain keeper) */
  dynamic: boolean;
  /** bounds of a dynamic fee, omitted when the pool has none (keeper-set fees) */
  min?: number;
  max?: number;
  /** fee charged instead on the first swap of a block, when the pool has one enabled */
  firstSwap?: number;
};

export type ClmSwapFees = Record<string, ClmSwapFee>;
