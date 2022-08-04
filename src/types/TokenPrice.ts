/**
 * The key can be the token symbol (ETH, BTC.e, etc)
 * Or the vault id which is the price of the underlying want token
 */
export interface TokenPrices {
  [key: string]: number;
}
