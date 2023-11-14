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
  BSX: {
    name: 'BSX',
    symbol: 'BSX',
    address: '0xd5046B976188EB40f6DE40fB527F89c05b323385',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xd5046B976188EB40f6DE40fB527F89c05b323385.svg',
    website: 'https://baseswap.fi/',
    description:
      'BSX is the incentives token of BaseSwap, rewarded to liquidity providers in the BaseSwap ecosystem. xBSX is the escrow version of BSX and can be vested over time.',
    documentation: 'https://base-swap-1.gitbook.io/baseswap/tokenomics/usdbsx-token',
    bridge: 'native',
  },
  BASO: {
    name: 'BASO',
    symbol: 'BASO',
    address: '0x23E1A3BcDcEE4C59209d8871140eB7DD2bD9d1cE',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x23E1A3BcDcEE4C59209d8871140eB7DD2bD9d1cE.svg',
    website: 'https://www.baso.finance/',
    description:
      'BASO is the governance token of Baso Finance, a Velodrome inspired DEX. Liquidity providers are rewarded with BASO and veBASO holders vote on liquidity pools to receive bribes and trading fees.',
    documentation: 'https://basofinance.gitbook.io/basofinance/',
    bridge: 'native',
  },
  agEUR: {
    name: 'agEUR',
    symbol: 'agEUR',
    address: '0xA61BeB4A3d02decb01039e378237032B351125B4',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://app.angle.money/',
    description:
      'Angle is a decentralized, capital-efficient and over-collateralized stablecoins protocol.',
    bridge: 'layer-zero',
    documentation: 'https://docs.angle.money/',
  },
  THALES: {
    name: 'Thales DAO Token',
    symbol: 'THALES',
    address: '0xf34e0cff046e154CAfCae502C7541b9E5FD8C249',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://thalesmarket.io/markets',
    description:
      'Thales is an Ethereum protocol that allows the creation of peer-to-peer parimutuel markets that anyone can join.',
    documentation: 'https://docs.thalesmarket.io/',
    bridge: 'celer',
  },
  SONNE: {
    name: 'Sonne',
    symbol: 'SONNE',
    address: '0x22a2488fE295047Ba13BD8cCCdBC8361DBD8cf7c',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://sonne.finance/',
    description:
      'Sonne Finance is an EVM compatible lending/borrowing protocol that has launched on multiple chains. Sonne Finance provides peer-to-peer lending solutions that are fully decentralized, transparent and non-custodial.',
    documentation: 'https://docs.sonne.finance/',
    bridge: 'axelar',
  },
  UNIDX: {
    name: 'Unidex',
    symbol: 'UNIDX',
    address: '0x6B4712AE9797C199edd44F897cA09BC57628a1CF',
    chainId: 8453,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x6B4712AE9797C199edd44F897cA09BC57628a1CF.svg',
    website: 'https://app.unidex.exchange/trading',
    description:
      'UniDex is building on top of the existing landscape by introducing a perpetual leverage trading platform that will allow any synthetic asset to be traded in a permissionless, transparent, and trader-focused platform for any person to tap into.',
    documentation: 'https://unidexexchange.gitbook.io/unidex/',
    bridge: 'synapse',
  },
  axlWBTC: {
    name: 'Axelar Wrapped WBTC',
    symbol: 'axlWBTC',
    address: '0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad',
    chainId: 8453,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1a35EE4640b0A3B87705B0A4B45D227Ba60Ca2ad.svg',
    website: 'https://wbtc.network/',
    description: 'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin.',
    documentation: 'https://wbtc.network/',
    bridge: 'axelar',
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
  OVN: {
    name: 'OVN',
    symbol: 'OVN',
    address: '0xA3d1a8DEB97B111454B294E2324EfAD13a9d8396',
    chainId: 8453,
    decimals: 18,
    website: 'https://overnight.fi/',
    description:
      'OVN token is a utility token that serves multiple purposes in the Overnight protocol. It is used for bribes to promote USD+ and incentivize conservative risk decisions, as well as for voting rights to establish decentralized risk monitoring and management processes.',
    bridge: 'axelar',
    logoURI: '',
    documentation: 'https://docs.overnight.fi/',
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
    documentation: 'https://www.circle.com/en/usdc-multichain/base',
    bridge: 'axelar',
  },
  axlUSDT: {
    name: 'USDT',
    symbol: 'axlUSDT',
    address: '0x7f5373AE26c3E8FfC4c77b7255DF7eC1A9aF52a6',
    chainId: 8453,
    decimals: 6,
    website: 'https://tether.to/',
    documentation: 'https://docs.axelar.dev/',
    description:
      'Tether (Axelar) is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
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
    description: 'USDC.e is an Ethereum-based USDC bridged via the official Base Bridge.',
    chainId: 8453,
    logoURI: '',
    documentation: 'https://www.circle.com/blog/usdc-now-available-natively-on-base',
    bridge: 'base-canonical',
  },
  USDC: {
    name: 'USD Circle',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 8453,
    logoURI: '',
    documentation: 'https://developers.circle.com/docs',
    bridge: 'native',
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
  AERO: {
    name: 'Aerodrome',
    symbol: 'AERO',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    chainId: 8453,
    decimals: 18,
    website: 'https://aerodrome.finance/',
    documentation: 'https://aerodrome.finance/docs',
    description:
      "Aerodrome Finance is a next-generation AMM designed to serve as Base's central liquidity hub, combining a powerful liquidity incentive engine, vote-lock governance model, and friendly user experience. Aerodrome inherits the latest features from Velodrome V2.",
    logoURI: '',
    bridge: 'native',
  },
  DOLA: {
    name: 'Dola USD Stablecoin',
    symbol: 'DOLA',
    address: '0x4621b7A9c75199271F773Ebd9A499dbd165c3191',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://www.inverse.finance/',
    description:
      'Inverse.finance is a suite of permissionless decentralized finance tools governed by Inverse DAO, a decentralized autonomous organization running on the Ethereum blockchain.',
    bridge: 'base-canonical',
  },
  bMAI: {
    name: 'Mai Stablecoin',
    symbol: 'bMAI',
    address: '0xbf1aeA8670D2528E08334083616dD9C5F3B087aE',
    chainId: 8453,
    decimals: 18,
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stablecoin collateralized by your crypto holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png',
    documentation: 'https://docs.mai.finance/',
    bridge: 'native',
  },
  wUSDR: {
    name: 'Real USD',
    symbol: 'wUSDR',
    address: '0x9483ab65847A447e36d21af1CaB8C87e9712ff93',
    chainId: 8453,
    decimals: 9,
    website: 'https://www.tangible.store/realusd',
    documentation: 'https://docs.tangible.store/',
    description:
      'Real USD (USDR) is the world’s first stablecoin collateralized by tokenized, yield-producing real estate. USDR has a value accrual system built into its design. Using a consistent stream of dependable yield derived from rental revenue, Real USD delivers a native yield to holders.',
    logoURI: '',
    bridge: 'layer-zero',
  },
  tBTC: {
    name: 'tBTC v2',
    symbol: 'tBTC',
    address: '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://threshold.network/',
    documentation: 'https://docs.threshold.network/',
    description:
      'Threshold is the first ever on-chain merge between two existing networks and communities, Keep and NuCypher. Threshold provides a suite of threshold cryptography services that power user sovereignty on the blockchain.',
    bridge: 'wormhole',
  },
  BASED: {
    name: 'based.markets',
    symbol: 'BASED',
    address: '0xBa5E6fa2f33f3955f0cef50c63dCC84861eAb663',
    chainId: 8453,
    decimals: 18,
    website: 'https://www.based.markets/',
    description:
      'Based offers intent-based P2P derivatives with deep liquidity sourced from centralized exchanges.',
    logoURI: '',
    bridge: 'native',
  },
  crvUSD: {
    name: 'Curve.Fi USD Stablecoin',
    symbol: 'crvUSD',
    address: '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://crvusd.curve.fi/',
    description:
      'crvUSD is a collateralized-debt-position (CDP) stablecoin pegged to the US Dollar',
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
  rETH: {
    name: 'Rocket Pool ETH',
    symbol: 'rETH',
    address: '0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c',
    chainId: 8453,
    decimals: 18,
    website: 'https://rocketpool.net/',
    description:
      'As a Rocket Pool staker, your role is to deposit ETH into the deposit pool which will enable a node operator to create a new Beacon Chain validator. You can stake as little as 0.01 ETH. In doing so, you will be given a token called rETH. rETH represents both how much ETH you deposited, and when you deposited it.',
    bridge: 'base-canonical',
    logoURI: '',
    documentation: 'https://docs.rocketpool.net/guides/',
  },
  FTW: {
    name: 'FriendTech33',
    symbol: 'FTW',
    address: '0x3347453Ced85bd288D783d85cDEC9b01Ab90f9D8',
    chainId: 8453,
    decimals: 9,
    logoURI: '',
    website: 'https://friendtech33.xyz',
    description:
      'FriendTech33 combines the metas of Friend Tech into a DAO format backing a deeply liquid reserve currency with Friend Tech assets including keys, wrapped keys, ecosystem related project tokens, and finally the airdropped token itself.',
    bridge: 'native',
  },
  SCALE: {
    name: 'Scale',
    symbol: 'SCALE',
    address: '0x54016a4848a38f257B6E96331F7404073Fd9c32C',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://base.equalizer.exchange/',
    description:
      'Equalizer was derived from the initial concept of Andre Cronje. The mechanism that was used to create a perpetual decentralized exchange was unique and ingenious. The launch of this platform is to take the concept and apply it to a more natural style DEX. Equalizer will become the trading mechanism for the Fantom network, utilizing the Solidly perpetual model with some tweaks to fee structures and emissions. ',
    documentation: 'https://docs.equalizer.exchange/',
    bridge: 'native',
  },
  hyUSD: {
    name: 'High Yield USD',
    symbol: 'hyUSD',
    address: '0xCc7FF230365bD730eE4B352cC2492CEdAC49383e',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://linktr.ee/hyusd',
    description:
      'A decentralized flatcoin that provides convenient access to DeFi yields, enabling holders to earn passive income on their capital. Governance should aim to take low to moderate risk to return high DeFi yields in order to mitigate against inflation.',
    documentation: '',
    bridge: 'native',
  },
  eUSD: {
    name: 'Electronic Dollar',
    symbol: 'eUSD',
    address: '0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website:
      'https://register.app/#/overview?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F&chainId=1',
    description:
      'The Electronic Dollar (eUSD) is a decentralized 1:1 asset-backed stablecoin built with Reserve Protocol, available on the Ethereum and MobileCoin blockchains. It sets itself apart from other stablecoins due to its decentralized, community-governed, and censorship-resistant nature.',
    documentation: '',
    bridge: 'base-canonical',
  },
  wstETH: {
    name: 'Wrapped liquid staked Ether 2.0',
    symbol: 'wstETH',
    address: '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
    chainId: 8453,
    decimals: 18,
    logoURI: '',
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    documentation: 'https://docs.lido.fi/',
    bridge: 'base-canonical',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
