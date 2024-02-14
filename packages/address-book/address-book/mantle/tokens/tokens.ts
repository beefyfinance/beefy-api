import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const MNT = {
  name: 'Wrapped Mantle',
  address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8',
  symbol: 'WMNT',
  oracleId: 'WMNT',
  decimals: 18,
  chainId: 5000,
  website: 'https://www.mantle.xyz/',
  description:
    'With Mantle Network, an Ethereum rollup, Mantle Treasury and a token holder governed roadmap for products and initiatives.',
  bridge: 'native',
  logoURI: '',
  documentation: 'https://docs.mantle.xyz/governance/introduction/overview',
} as const;

const _tokens = {
  MNT,
  WMNT: MNT,
  WNATIVE: MNT,
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    oracleId: 'USDC',
    address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
    chainId: 5000,
    decimals: 6,
    logoURI: '',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'mantle-canonical',
  },
  MOE: {
    name: 'Moe Token',
    symbol: 'MOE',
    oracleId: 'MOE',
    address: '0x4515A45337F461A11Ff0FE8aBF3c606AE5dC00c9',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://merchantmoe.com/',
    documentation: 'https://docs.merchantmoe.com/merchant-moe/',
    description:
      'Merchant Moe is a traders oasis in the bustling world of Decentralized Finance (DeFi) on Mantle Network, offering a comprehensive and user-friendly Decentralized Exchange (DEX) experience.',
    bridge: 'native',
  },
  JOE: {
    name: 'Joe Token',
    symbol: 'JOE',
    oracleId: 'mJOE',
    address: '0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://traderjoexyz.com/',
    documentation: 'https://docs.traderjoexyz.com/',
    description:
      'Trader Joe is your one-stop decentralized trading platform on the Avalanche & Arbitrum networks, of which JOE is the governance token that rewards its holders with a share of exchange revenues.',
    bridge: 'layer-zero',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE',
    chainId: 5000,
    decimals: 6,
    logoURI: '',
    website: 'https://tether.to/',
    documentation: 'https://tether.to/en/knowledge-base/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'mantle-canonical',
  },
  KTC: {
    name: 'KTX Community Token',
    symbol: 'KTC',
    oracleId: 'KTC',
    address: '0x779f4E5fB773E17Bc8E809F4ef1aBb140861159a',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://www.ktx.finance/',
    documentation: 'https://docs.ktx.finance/',
    description:
      'Built on top of BNB Chain and Mantle Network, KTC is the community token of KTX.Finance which aims to create a capital-efficient, decentralized spot and perpetual exchange accessible to everyone.',
    bridge: 'native',
  },
  WBTC: {
    name: 'WBTC',
    symbol: 'WBTC',
    oracleId: 'WBTC',
    address: '0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2',
    chainId: 5000,
    decimals: 8,
    logoURI: '',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    bridge: 'mantle-canonical',
  },
  LEND: {
    name: 'Lendle Protocol Token',
    symbol: 'LEND',
    oracleId: 'LEND',
    address: '0x25356aeca4210eF7553140edb9b8026089E49396',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://www.lendle.xyz/',
    documentation: 'https://docs.lendle.xyz/',
    description:
      "LEND token compliments Lendle by incentivizing the supply and borrow of the assets in the Lendle markets. The LEND rewards will vest over a period of 3 months, and users will share in the protocol's revenue during this period.",
    bridge: 'native',
  },
  MINU: {
    name: 'Mantle Inu Token',
    symbol: 'MINU',
    oracleId: 'MINU',
    address: '0x51cfe5b1E764dC253F4c8C1f19a081fF4C3517eD',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://mantleinu.xyz/',
    documentation: 'https://mantle-inu.gitbook.io/docs/',
    description: 'MINU is the #1 memecoin on Mantle.',
    bridge: 'native',
  },
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    oracleId: 'WETH',
    address: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://weth.io/',
    documentation: 'https://ethereum.org/en/developers/docs/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'mantle-canonical',
  },
  USDY: {
    name: 'Ondo U.S. Dollar Yield',
    symbol: 'USDY',
    oracleId: 'USDY',
    address: '0x5bE26527e817998A7206475496fDE1E68957c5A6',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://ondo.finance/',
    documentation: 'https://ondo.finance/usdy/',
    description:
      'USDY is a tokenized note secured by short-term US Treasuries and bank demand deposits. USDY is accessible to non-US individual and institutional investors and is transferable onchain 40-50 days after purchase.',
    bridge: 'axelar',
  },
  mETH: {
    name: 'Mantle Staked Ether',
    symbol: 'mETH',
    oracleId: 'mETH',
    address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
    chainId: 5000,
    decimals: 18,
    logoURI: '',
    website: 'https://www.mantle.xyz/meth/',
    documentation: 'https://docs.mantle.xyz/meth/introduction/overview/',
    description:
      'A permissionless, non-custodial ETH liquid staking protocol deployed on Ethereum L1 and governed by Mantle.',
    bridge: 'mantle-canonical',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
