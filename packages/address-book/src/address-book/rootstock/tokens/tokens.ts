import type { Token } from '../../../types/token.js';

const RBTC = {
  name: 'Wrapped Rootstock BTC',
  address: '0x542fDA317318eBF1d3DEAf76E0b632741A7e677d',
  symbol: 'WRBTC',
  oracleId: 'WBTC',
  decimals: 18,
  chainId: 30,
  website: 'https://rootstock.io/rbtc/',
  description:
    'RBTC, the smart version of Bitcoin. Allowing BTC owners to interact with DeFi protocols and dApps on Rootstock network for minting, swaps, gas fees and more.',
  bridge: 'rootstock-canonical',
  logoURI: '',
  documentation:
    'https://dev.rootstock.io/concepts/rbtc/?_gl=1*jp93v6*_gcl_au*ODQ3NTgwNDM3LjE3MjcyNjIwNDI.',
} as const satisfies Token;

export const tokens = {
  RBTC,
  WRBTC: RBTC,
  WNATIVE: RBTC,
  ETHs: {
    name: 'Sovryn ETH',
    address: '0x1D931Bf8656d795E50eF6D639562C5bD8Ac2B78f',
    symbol: 'ETHs',
    oracleId: 'WETH',
    decimals: 18,
    chainId: 30,
    website: 'https://wiki.sovryn.com/en/sovryn-dapp/bridge',
    description: 'Sovryn ETH is a ETH aggregated token on Rootstock',
    bridge: 'sovryn',
    logoURI: '',
    documentation: 'https://wiki.sovryn.com/en/sovryn-dapp/bridge',
  },
  rUSDT: {
    name: 'Rootstock USDT',
    address: '0xef213441A85dF4d7ACbDaE0Cf78004e1E486bB96',
    symbol: 'rUSDT',
    oracleId: 'USDT',
    decimals: 18,
    chainId: 30,
    website: 'https://dapp.tokenbridge.rootstock.io/',
    description: 'Rootstock Bridged USDT from the Ethereum Network',
    bridge: 'rootstock-canonical',
    logoURI: '',
    documentation: 'https://dapp.tokenbridge.rootstock.io/',
  },
  DOC: {
    name: 'Dollar on Chain',
    address: '0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db',
    symbol: 'DOC',
    oracleId: 'DOC',
    decimals: 18,
    chainId: 30,
    website: 'https://moneyonchain.com/doc-stablecoin/',
    description:
      'Dollar on Chain (DoC) - A token that is pegged 1:1 to the US Dollar, and is crypto-collateralized in Bitcoin',
    bridge: 'native',
    logoURI: '',
    documentation: 'https://api.moneyonchain.com/docs/guide',
  },
  RIF: {
    name: 'RIF',
    address: '0x2AcC95758f8b5F583470ba265EB685a8F45fC9D5',
    symbol: 'RIF',
    oracleId: 'RIF',
    decimals: 18,
    chainId: 30,
    website: 'https://rif.technology/',
    description:
      'RIF was created to make it easier for developers to build on Bitcoin using Rootstock by proposing and developing a unified set of protocols, rules and interfaces for decentralized infrastructure services, including: Bridges, Name Resolution Services, Payments, Data Feeds (i.e. Oracles) and Bitcoin DeFi Wallets.',
    bridge: 'native',
    logoURI: '',
    documentation: 'https://dev.rootstock.io/',
  },
} as const satisfies Record<string, Token>;
