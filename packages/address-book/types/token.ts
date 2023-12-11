interface Token {
  name: string;
  symbol: string;
  oracleId: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
  documentation?: string;
  oracle?: 'tokens' | 'lps';
  bridge?: string;
  staked?: boolean;
}
export default Token;
