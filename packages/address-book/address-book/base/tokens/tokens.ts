import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  decimals: 18,
  chainId: 8453,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'base',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  cbETH: {
    name: 'Coinbase Wrapped Staked ETH',
    symbol: 'cbETH',
    address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22.svg',
    website: '',
    description:
      "Coinbase Wrapped Staked ETH (“cbETH”) is a utility token that represents Ethereum 2 (ETH2), which is ETH staked through Coinbase. Over time, the price of cbETH will likely deviate from ETH because cbETH represents 1 staked ETH plus all of its accrued staking interest starting from when cbETH's conversion rate and balance were initialized (June 16, 2022 19:34 UTC). cbETH is minted exclusively by Coinbase.",
    documentation:
      'https://help.coinbase.com/en/coinbase/trading-and-funding/staking-rewards/cbeth',
    bridge: 'native',
  },
  axlUSDC: {
    name: 'Axelar Wrapped USDC',
    symbol: 'axlUSDC',
    address: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    chainId: 8453,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xEB466342C4d449BC9f53A865D5Cb90586f405215.svg',
    website: '',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
    bridge: 'axelar',
  },
  OGRE: {
    name: 'SHREKT',
    symbol: 'OGRE',
    address: '0xAB8a1c03b8E4e1D21c8Ddd6eDf9e07f26E843492',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xAB8a1c03b8E4e1D21c8Ddd6eDf9e07f26E843492.svg',
    website: '',
    description: 'Meme coin on Base.',
    documentation: '',
    bridge: 'native',
  },
  USDbC: {
    name: 'USD Base Coin',
    address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    symbol: 'USDbC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 8453,
    logoURI: '',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
    bridge: 'base',
  },
  DAI: {
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://makerdao.com/en/',
    bridge: 'base',
    documentation:
      'https://docs.makerdao.com/smart-contract-modules/dai-module/dai-detailed-documentation',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
  },
  bsUSD: {
    name: 'Balancer Stable Pool',
    symbol: 'bsUSD',
    address: '0x6FbFcf88DB1aADA31F34215b2a1Df7fafb4883e9',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://app.balancer.fi/#/',
    bridge: 'native',
    documentation: 'https://docs.balancer.fi/products/balancer-pools/boosted-pools',
    description:
      'Balancer composable pool that consist of USDbC and DAI. bbTokens are boosted linear pools.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
