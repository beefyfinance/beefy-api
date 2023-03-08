export declare function fetchAmmPrices(
  pools: any,
  knownPrices: Record<string, number>
): Promise<{
  poolPrices: Record<string, number>;
  tokenPrices: Record<string, number>;
  lpsBreakdown: Record<
    string,
    {
      price: number;
      tokens: string[];
      balances: string[];
      totalSupply: string;
    }
  >;
}>;
