export type PricesById = Record<string, number>;

export type PriceOnlyLpBreakdown = {
  price: number;
};

export type StandardLpBreakdown = PriceOnlyLpBreakdown & {
  tokens: string[];
  balances: string[];
  totalSupply: string;
};

export type ClmLpBreakdown = StandardLpBreakdown & {
  underlyingLiquidity: string;
  underlyingBalances: string[];
  underlyingPrice: number;
};

export type LpBreakdown = PriceOnlyLpBreakdown | StandardLpBreakdown | ClmLpBreakdown;

export type BreakdownsById = Record<string, LpBreakdown>;
