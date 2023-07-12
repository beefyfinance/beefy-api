interface Token {
  name: string;
  symbol: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
  documentation?: string;
  oracleId?: string;
  oracle?: 'tokens' | 'lps';
  bridge?: string;
}
export default Token;
