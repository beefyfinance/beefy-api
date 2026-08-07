export const plus = {
  name: 'PLUS Mainnet',
  chainId: 88088,
  rpc: ['https://plusmain.net/api/rpc'],
  explorerUrl: 'https://plusmain.net/scan',
  explorerTokenUrl: 'https://plusmain.net/scan/token/{address}',
  nativeCurrency: {
    name: 'PLUS',
    symbol: 'PLUS',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
  },
} as const;
