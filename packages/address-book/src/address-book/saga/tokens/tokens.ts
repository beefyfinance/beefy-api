import type { Token } from '../../../types/token.js';

const GAS = {
  name: 'Wrapped GAS',
  address: '0xE3dbcD53f4Ce1b06Ab200f4912BD35672e68f1FA', // dummy wrapped gas
  symbol: 'WGAS',
  oracleId: 'WGAS',
  decimals: 18,
  chainId: 5464,
  website: 'https://www.saga.xyz/',
  description:
    'Meta-token for gas on Saga. Saga is gasless for users. Do not use the token at this address.',
  bridge: 'native',
  documentation: 'https://docs.saga.xyz/',
} as const satisfies Token;

const USDC = {
  name: 'USDC',
  address: '0xfc960C233B8E98e0Cf282e29BDE8d3f105fc24d5',
  symbol: 'USDC',
  oracleId: 'USDC',
  decimals: 6,
  chainId: 5464,
  website: 'https://www.centre.io/',
  description:
    'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  bridge: 'saga-canonical',
  logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
  documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
} as const satisfies Token;

export const tokens = {
  WNATIVE: GAS,
  FEES: USDC,
  GAS,
  WGAS: GAS,
  USDC,
  SAGA: {
    name: 'Saga',
    address: '0xA19377761FED745723B90993988E04d641c2CfFE',
    symbol: 'SAGA',
    oracleId: 'SAGA',
    decimals: 6,
    chainId: 5464,
    website: 'https://www.saga.xyz/',
    description:
      'Saga is a layer 1 to launch L1s, or “Chainlets.” Instead of competing for blockspace on one monolithic chain, each application on Saga is hosted on one or more parallelized and interoperable dedicated chains that can be elastically scaled with the application needs. Saga is better for users, developers and the blockchain ecosystem.',
    bridge: 'saga-canonical',
    logoURI: '',
    documentation: 'https://www.saga.xyz/saga-protocol',
  },
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0xeb41D53F14Cb9a67907f2b8b5DBc223944158cCb',
    chainId: 5464,
    decimals: 18,
    logoURI: '',
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'saga-canonical',
    documentation: 'https://ethereum.org/en/developers/docs/',
  },
  USDT: {
    name: 'Tether',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0xC8fe3C1de344854f4429bB333AFFAeF97eF88CEa',
    chainId: 5464,
    decimals: 6,
    logoURI: '',
    website: 'https://www.tether.to/',
    description:
      'Tether is a stablecoin pegged to the US dollar. Tether is issued by Tether Limited, a Gibraltar-based company.',
    bridge: 'saga-canonical',
    documentation: 'https://www.tether.to/',
  },
  UNI: {
    name: 'Uniswap',
    symbol: 'UNI',
    oracleId: 'UNI',
    address: '0x4E33613adD93463E82A14080021f2FfaF1e062CF',
    chainId: 5464,
    decimals: 18,
    logoURI: '',
    website: 'https://www.uniswap.org/',
    description: 'Uniswap is a decentralized exchange (DEX) on the Ethereum blockchain.',
    bridge: 'saga-canonical',
    documentation: 'https://www.uniswap.org/',
  },
} as const satisfies Record<string, Token>;
