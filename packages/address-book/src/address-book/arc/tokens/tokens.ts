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
  xAERO: {
    name: 'Aero',
    symbol: 'xAERO',
    oracleId: 'arcXAERO',
    address: '0x20077cC0d5E385A0Fe9C91bbC7DC744f51559307',
    chainId: 5042,
    decimals: 18,
    website: 'https://aero.xyz/',
    description: 'Aero receipt token on Arc.',
  },
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0x128cC466B61f542da60c70e3aA11c10e19B84EDB',
    chainId: 5042,
    decimals: 18,
    website: 'https://weth.io/',
    description: 'Wrapped Ether is an ERC-20 token representing Ether (ETH).',
    documentation: 'https://ethereum.org/en/developers/docs/',
    tags: ['BLUECHIP'],
  },
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
    documentation: 'https://developers.circle.com/assets/what-is-cirbtc',
    bridge: 'native',
    tags: ['BLUECHIP'],
  },
  EURC: {
    name: 'EURC',
    symbol: 'EURC',
    oracleId: 'arcEURC',
    address: '0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1',
    chainId: 5042,
    decimals: 6,
    website: 'https://www.circle.com/en/eurc',
    description:
      'EURC is a euro-backed stablecoin that’s accessible globally on Arc, Avalanche, Ethereum, Base and Stellar. Similar to USDC, EURC is issued by Circle under a full-reserve model.',
    bridge: 'native',
    tags: ['STABLECOIN'],
  },
  COOL: {
    name: 'usdc is cool',
    symbol: 'COOL',
    oracleId: 'COOL',
    address: '0xEb64987643db71c76b2a2BE7E723DECC995E5b37',
    chainId: 5042,
    decimals: 18,
    website: 'https://usdcis.cool/',
    description:
      '	Cool shades on a stablecoin. COOL ("USDC is cool") is an independent community memecoin build on Arc.',
    bridge: 'native',
    tags: ['MEMECOIN', 'NO_AUDIT', 'LARGE_HOLDERS'],
  },
  TOLLY: {
    name: 'Tolly',
    symbol: 'TOLLY',
    oracleId: 'TOLLY',
    address: '0xBc43CE8DEc648EA298C4275559b81D6261c90b67',
    chainId: 5042,
    decimals: 18,
    website: 'https://tollylabs.com/tokens',
    description:
      '	TOLLY is the native protocol token of TOLLY Labs’ Arc market terminal and token launchpad. Protocol buy fees are used to fund market purchases and removal of TOLLY from circulation.',
    documentation: 'https://tollylabs.com/guide',
    bridge: 'native',
    tags: ['MEMECOIN', 'NO_AUDIT', 'NO_TIMELOCK', 'LARGE_HOLDERS'],
  },
} as const satisfies Record<string, Token>;
