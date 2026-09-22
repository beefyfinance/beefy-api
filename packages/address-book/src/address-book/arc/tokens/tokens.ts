import type { Token } from '../../../types/token.js';

const USDC = {
  name: 'USD Coin',
  address: '0x3600000000000000000000000000000000000000',
  symbol: 'USDC',
  oracleId: 'USDC',
  decimals: 6,
  chainId: 5042,
  website: 'https://www.circle.com/usdc',
  description:
    'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  bridge: 'native',
  documentation: 'https://developers.circle.com/docs',
  tags: ['STABLECOIN'],
} as const satisfies Token;

export const tokens = {
  // No wrapper on arc: 0x3600 is the 6-decimal ERC-20 view of the 18-decimal native balance (no deposit/withdraw)
  WNATIVE: USDC,
  FEES: USDC,
  USDC,
  cirBTC: {
    name: 'Circle Wrapped Bitcoin',
    symbol: 'cirBTC',
    oracleId: 'cirBTC',
    address: '0x171A4217b86A807A64eB94757Db6849fb4bDbAA0',
    chainId: 5042,
    decimals: 8,
    website: 'https://www.circle.com/cirbtc',
    description:
      'Circle Wrapped Bitcoin is a BTC-backed token issued by Circle that provides exposure to Bitcoin on Arc and unlocks utility for institutional markets.',
    documentation: 'https://developers.circle.com/docs/cirbtc',
    bridge: 'native',
    tags: ['BLUECHIP'],
  },
  arcEURC: {
    name: 'EURC',
    symbol: 'EURC',
    oracleId: 'arcEURC',
    address: '0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1',
    chainId: 5042,
    decimals: 6,
    website: 'https://www.circle.com/en/eurc',
    description:
      'EURC is a euro-backed stablecoin that’s accessible globally on Avalanche, Ethereum, Base and Stellar. Similar to USDC, EURC is issued by Circle under a full-reserve model.',
    bridge: 'native',
    tags: ['STABLECOIN'],
  },
  ARGUS: {
    name: 'Argus',
    symbol: 'ARGUS',
    oracleId: 'ARGUS',
    address: '0xeCe5cA8bf9220718E5727754026757512212cb3c',
    chainId: 5042,
    decimals: 18,
    website: 'https://argus.world/',
    description:
      'Argus is the native token launchpad on Arc blockchain, facilitating discovery, launch configuration, market activity and holder rewards through a single protocol. ARGUS is the native token of Argus, launched with its own launchpad. By charging a 1% buy and sell tax on pool trades, ARGUS generates tax from volume which is used to buy back and burn ARGUS, accruing value to its holders.',
    documentation: 'https://argus.world/docs',
    bridge: 'native',
    tags: ['NO_TIMELOCK', 'MEMECOIN'],
  },
} as const satisfies Record<string, Token>;
