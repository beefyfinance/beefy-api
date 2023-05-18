import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const CANTO = {
  name: 'Wrapped Canto',
  address: '0x826551890Dc65655a0Aceca109aB11AbDbD7a07B',
  symbol: 'WCANTO',
  decimals: 18,
  chainId: 7700,
  website: 'https://canto.io/',
  description:
    'Canto is a permissionless general-purpose blockchain running the Ethereum Virtual Machine (EVM). It was built to deliver on the promise of DeFi – that through a post-traditional financial movement, new systems will be made accessible, transparent, decentralized, and free.',
  logoURI: '',
  documentation: 'https://docs.canto.io/',
} as const;

const _tokens = {
  CANTO,
  WCANTO: CANTO,
  WNATIVE: CANTO,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    chainId: 7700,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    documentation: 'https://docs.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  ATOM: {
    name: 'Cosmos Token',
    symbol: 'ATOM',
    address: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
    chainId: 7700,
    decimals: 6,
    website: 'https://cosmos.network/',
    description:
      'Cosmos is an ever-expanding ecosystem of interconnected apps and services, built for a decentralized future.',
    logoURI: '',
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  NOTE: {
    name: 'Note',
    symbol: 'NOTE',
    address: '0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://canto.io/',
    documentation: 'https://docs.canto.io/overview/canto-unit-of-account-usdnote',
    description:
      '$NOTE is the unit of account on Canto. $NOTE is an over-collateralized currency with a value perpetually rebalanced toward $1 through an algorithmic interest rate policy. ',
  },
  USDC: {
    name: 'USD Coin',
    address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 7700,
    logoURI: '',
    documentation: 'https://developers.circle.com/docs',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    address: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
    chainId: 7700,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: '',
  },
  FLOWV1: {
    name: 'Velocimeter',
    symbol: 'FLOWv1',
    address: '0x2Baec546a92cA3469f71b7A091f7dF61e5569889',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://canto.velocimeter.xyz/home',
    description:
      'Velocimeter addresses these issues and presents an attractive alternative by addressing the core issues in Solidly and adding its own improvements. To recall, the key innovation of Solidly was to align protocol emissions with fees generated, not simply liquidity. To do this, it would allow protocols and other large stakeholders to become veNFT "voters", using their locked voting power to direct future emissions and collecting fees (termed bribes in Solidly) from the pools they voted for.',
    documentation: 'https://docs.velocimeter.xyz/',
  },
  GRAV: {
    name: 'Graviton',
    symbol: 'GRAV',
    address: '0xc03345448969Dd8C00e9E4A85d2d9722d093aF8E',
    chainId: 7700,
    decimals: 6,
    logoURI: '',
    website: 'https://www.gravitybridge.net/',
    description:
      'Cosmos Gravity Bridge™ is a purpose-built, fully decentralized, trustless blockchain which bridges assets between the Ethereum and Cosmos ecosystems. Ethereum and EVM compatible tokens can be transferred across the Gravity Bridge to a Cosmos wallet and then onto other Cosmos wallets or DEXs (such as Osmosis or Gravity DEX). Cosmos SDK based blockchains can similarly send tokens across Gravity Bridge to the Ethereum ecosystem, making them available for transfer or potentially trading on Uniswap or other ETH DEXs.',
    documentation: 'https://www.gravitybridge.net/post/how-gravity-works',
  },
  FLOW: {
    name: 'Velocimeter',
    symbol: 'FLOW',
    address: '0xB5b060055F0d1eF5174329913ef861bC3aDdF029',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://canto.velocimeter.xyz/home',
    description:
      'Velocimeter addresses these issues and presents an attractive alternative by addressing the core issues in Solidly and adding its own improvements. To recall, the key innovation of Solidly was to align protocol emissions with fees generated, not simply liquidity. To do this, it would allow protocols and other large stakeholders to become veNFT "voters", using their locked voting power to direct future emissions and collecting fees (termed bribes in Solidly) from the pools they voted for.',
    documentation: 'https://docs.velocimeter.xyz/',
  },
  SOMM: {
    name: 'Somm',
    symbol: 'SOMM',
    address: '0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864',
    chainId: 7700,
    decimals: 6,
    logoURI: '',
    website: 'https://app.sommelier.finance/',
    description:
      'Sommelier is a DeFi blockchain protocol, built on the Cosmos SDK, and a bi-directional Ethereum bridge. Taken together, this collection serves as a co-processor to Ethereum - that is we are using a Cosmos chain to process as many of the calculations as possible off Ethereum. The protocol is powered by validators and LPs who can benefit from a wide array of transaction features, such as portfolio rebalancing and limit orders based on dynamically changing market conditions.',
    documentation:
      'https://tricky-sand-5e6.notion.site/Sommelier-Documentation-006e748753e34a1299f9b1d6ae3a4544',
  },
  multiBTC: {
    name: 'Multichain BTC',
    symbol: 'multiBTC',
    address: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
    chainId: 7700,
    decimals: 8,
    logoURI: '',
    website: 'https://app.multichain.org/',
    description: 'Multichain supports to swap BTC to MultiBTC (Multichain BTC) 1:1.',
    documentation: 'https://docs.multichain.org/getting-started/introduction',
  },
  BNB: {
    name: 'Binance Chain',
    symbol: 'BNB',
    address: '0xFb7F77faaA3b69ef4C15d6305C79AD92B387C89F',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
  },
  BUSD: {
    name: 'Binance USD',
    symbol: 'BUSD',
    address: '0x381Ea7A7EE6a1e2982e01E7b6837f775a1a4B07F',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos), Approved and regulated by the New York State Department of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from the official website.',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0x08638a74A8134c747Dce29B57472cc2B57F35653',
    chainId: 7700,
    decimals: 8,
    logoURI: '',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
  },
  cINU: {
    name: 'Canto Inu',
    symbol: 'cINU',
    address: '0x7264610A66EcA758A8ce95CF11Ff5741E1fd0455',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://www.cantoinu.com/',
    description:
      'Following in the pawprints of Dogecoin and Shiba Inu, Canto Inu is the native breed token to the Canto Blockchain. It is provided solely for entertainment purposes.',
  },
  CRE8R: {
    name: 'CRE8R DAO',
    symbol: 'CRE8R',
    address: '0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://cre8r.vip/',
    description:
      'The world’s first & only decentralized Web3 content marketing agency DAO. Massively scalable. Fueled by DeFi.',
  },
  wstETH: {
    name: 'Lido Wrapped Staked ETH',
    symbol: 'wstETH',
    address: '0xc71aAf8e486e3F33841BB56Ca3FD2aC3fa8D29a8',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    documentation: 'https://docs.lido.fi/',
  },
  stATOM: {
    name: 'Stride Staked ATOM',
    symbol: 'stATOM',
    address: '0x4A2a90D444DbB7163B5861b772f882BbA394Ca67',
    chainId: 7700,
    decimals: 6,
    logoURI: '',
    website: 'https://stride.zone/',
    description:
      'Using Stride’s liquid staked ATOM, you can earn both staking and DeFi yields across the Cosmos IBC ecosystem.',
    documentation: 'https://docs.stride.zone/docs',
  },
  INJ: {
    name: 'Injective',
    symbol: 'INJ',
    address: '0x1D54EcB8583Ca25895c512A8308389fFD581F9c9',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://injective.com/',
    description:
      'Injective is an open, interoperable layer-one blockchain for building powerful DeFi applications.',
    documentation: 'https://docs.injective.network/',
  },
  PEPE: {
    name: 'Pepe',
    symbol: 'PEPE',
    address: '0xf390830DF829cf22c53c8840554B98eafC5dCBc2',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://www.pepe.vip/',
    description:
      'Pepe is here to make memecoins great again. Launched stealth with no presale, zero taxes, LP burnt and contract renounced, $PEPE is a coin for the people, forever. Fueled by pure memetic power, let $PEPE show you the way.',
  },
  sCANTO: {
    name: 'Liquid Staked Canto',
    symbol: 'sCANTO',
    address: '0x9F823D534954Fc119E31257b3dDBa0Db9E2Ff4ed',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://www.scanto.io/',
    description:
      'By holding $sCANTO you are earning a prorata share of the validator rewards. When you stake $CANTO at scanto.io you get $sCANTO, a liquid staking derivative that can be used across a range of DeFi applications. Unlike staked $CANTO, the $sCANTO are freely transferable instead of locked as in the case of native staking.',
    documentation: 'https://docs.scanto.io/',
  },
  BLOTR: {
    name: 'sCANTO BLOTR',
    symbol: 'BLOTR',
    address: '0xFf0BAF077e8035A3dA0dD2abeCECFbd98d8E63bE',
    chainId: 7700,
    decimals: 18,
    logoURI: '',
    website: 'https://www.scanto.io/',
    description:
      '$BLOTR is the governance token for $sCANTO (Liquid Staked Canto) used to vote on protocol upgrades, incentivize $sCANTO liquidity pools, and for other future protocol mechanisms.',
    documentation: 'https://docs.scanto.io/governance-token',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
