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
  bridge: 'base-canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  axlWBTC: {
    name: 'Axelar Wrapped WBTC',
    symbol: 'axlWBTC',
    address: '0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad',
    chainId: 8453,
    decimals: 8,
    logoURI: 'https://tokens.pancakeswap.finance/images/0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad.svg',
    website: 'https://wbtc.network/',
    description: 'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin.',
    documentation: 'https://wbtc.network/',
    bridge: 'axelar'
  },
  BASE: {
    name: 'BASE',
    symbol: 'BASE',
    address: '0xd07379a755A8f11B57610154861D694b2A0f615a',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xd07379a755A8f11B57610154861D694b2A0f615a.svg',
    website: 'https://swapbased.finance/#/',
    description: 'BASE is the governance token of SwapBased, a DEX built on the Base blockchain.',
    documentation: 'https://docs.swapbased.finance/',
    bridge: 'native',
  },
  WELL: {
    name: 'WELL',
    symbol: 'WELL',
    address: '0xFF8adeC2221f9f4D8dfbAFa6B9a297d17603493D',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x511aB53F793683763E5a8829738301368a2411E3.svg',
    website: 'https://moonwell.fi/',
    description: 'WELL is the native governance token of the Moonwell protocol',
    bridge: 'wormhole',
  },
  ALB: {
    name: 'Alien Base',
    symbol: 'ALB',
    address: '0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://app.alienbase.xyz/swap',
    description: 'Reward token for the Alien Base DEX on the base chain. Farm and stake tokens.',
    documentation: 'https://docs.alienbase.xyz/',
    bridge: 'native',
  },
  'USD+': {
    name: 'USD+',
    symbol: 'USD+',
    address: '0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376',
    chainId: 8453,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376.svg',
    website: 'https://overnight.fi/',
    description:
      'USD+ is USDC that pays you yield daily via rebase. It is 100% collateralized with assets immediately convertible into USDC. Yield is generated via strategies such as lending and stable-to-stable pools. Initial strategies include Aave, Rubicon, and Pika.',
    documentation: 'https://docs.overnight.fi/',
    bridge: 'native',
  },
  'DAI+': {
    name: 'DAI+',
    symbol: 'DAI+',
    address: '0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275.svg',
    website: 'https://overnight.fi/',
    description:
      'DAI+ is DAI that pays you yield daily via rebase.  It is 100% collateralized with assets immediately convertible into DAI.  Yield is generated via strategies such as lending and stable-to-stable pools. Initial strategies include Aave, Rubicon, and Pika.',
    documentation: 'https://docs.overnight.fi/',
    bridge: 'native',
  },
  MIM: {
    name: 'Magic Internet Money',
    symbol: 'MIM',
    address: '0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D.svg',
    website: 'https://docs.abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    documentation: 'https://docs.abracadabra.money/',
    bridge: 'layer-zero',
  },
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
    bridge: 'base-canonical',
  },
  DAI: {
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://makerdao.com/en/',
    bridge: 'base-canonical',
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
  BVM: {
    name: 'Base Velocimeter',
    symbol: 'BVM',
    address: '0xd386a121991E51Eab5e3433Bf5B1cF4C8884b47a',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://base.velocimeter.xyz',
    description:
      'BVM is the native token for Velocimeter on Base (BVM), a project providing liquidity on the chain where it is needed most. The BVM token can be staked as or locked to earn rewards on the BVM platform.',
    documentation: 'https://docs.velocimeter.xyz/FVMtokenomics',
    bridge: 'native',
  },
  oBVM: {
    name: 'Option to buy BVM',
    symbol: 'oBVM',
    address: '0x762eb51D2e779EeEc9B239FFB0B2eC8262848f3E',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://base.velocimeter.xyz',
    description:
      'oBVM is an options token that helps to reduce sell pressure on the native BVM token. It is earned by liquidity providers (LPs) who provide liquidity to the BVM pools. oBVM can be redeemed for BVM at a discount, or it can be locked up for a period of time as veBVM. veBVM is a governance token that allows holders to vote on the distribution of emissions, as well as receive weekly bribes and fees.',
    documentation: 'https://docs.velocimeter.xyz/oFVMmech',
    bridge: 'native',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
