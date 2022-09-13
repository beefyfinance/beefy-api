import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const AVAX = {
  chainId: 43114,
  address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
  decimals: 18,
  name: 'Wrapped AVAX',
  symbol: 'WAVAX',
  website: 'https://www.avalabs.org/',
  description:
    'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
  logoURI:
    'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png',
} as const;

const _tokens = {
  CAI: {
    name: 'Colony Avalanche Index CAI',
    symbol: 'CAI',
    address: '0x48f88A3fE843ccb0b5003e70B4192c1d7448bEf0',
    chainId: 43114,
    decimals: 18,
    logoURI: '',
    website: 'https://www.colonylab.io/cai.html',
    description: 'Colony Avalanche Index - The easist way to invest in Avalanche. CAI is an index token investing in Avalanche's AVAX token and other ecosystem projects including BENQI and Trader Joe. The index excludes any rebasing or deflationary tokens.',
  },
  POPS: {
    name: 'Swapsicle',
    symbol: 'POPS',
    address: '0x240248628B7B6850352764C5dFa50D1592A033A8',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x152b9d0FdC40C096757F570A51E494bd4b943E50.svg',
    website: 'https://swapsicle.io/',
    description: 'Swapsicle is a decentralised exchange and its own utility token POPS. ',
  },
  BTCb: {
    name: 'Bitcoin',
    symbol: 'BTCb',
    address: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
    chainId: 43114,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x152b9d0FdC40C096757F570A51E494bd4b943E50.svg',
    website: 'https://bridge.avax.network/',
    description: 'official AVAX BRIDGE bridged BTC',
  },
  BPT: {
    name: 'Bold Point BPT',
    symbol: 'BPT',
    address: '0x1111111111182587795eF1098ac7da81a108C97a',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x1111111111182587795eF1098ac7da81a108C97a/logo.png',
    website: 'https://bp.yay.games/',
    description:
      'Bold Point is a NFT-based RPG game where players slash enemies, play against other players and get rewards from their crafting skills in the real world.',
  },
  DBY: {
    name: 'Metaderby DBY',
    symbol: 'DBY',
    address: '0x5085434227aB73151fAd2DE546210Cbc8663dF96',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x5085434227aB73151fAd2DE546210Cbc8663dF96/logo.png',
    website: 'https://metaderby.com/',
    description:
      'MetaDerby is the first free-to-play-and-earn horse racing metaverse where anyone can earn tokens through skilled gameplay and contribute to building the MetaDerby universe.',
  },
  beJOE: {
    name: 'Beefy JOE',
    symbol: 'beJOE',
    address: '0x1F2A8034f444dc55F963fb5925A9b6eb744EeE2c',
    chainId: 43114,
    decimals: 18,
    logoURI: '',
    website: 'https://beefy.com',
    description:
      'beJOE is a Beefy-wrapped version of veJOE. Holding beJOE will be a great way to earn a bunch of JOE. Beefy will max out emissions on boosted farms, 5% of emissions will then be distributed to beJOE stakers on Beefy.',
  },
  YETI: {
    name: 'Yeti YETI',
    symbol: 'YETI',
    address: '0x77777777777d4554c39223C354A05825b2E8Faa3',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://1786218689-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F4OftjbgGWmJOiwFRkFKr%2Fuploads%2FQWL5FOA2bShRZVnkrVL9%2Fyetitoken.png?alt=media&token=7e2a9b4a-4682-4438-ba58-9196e6cfcdc4',
    website: 'https://yeti.finance/',
    description:
      'The best borrowing experience on Avalanche. Borrow against your entire Avalanche portfolio interest-free.',
  },
  YUSD: {
    name: 'Yeti YUSD',
    symbol: 'YUSD',
    address: '0x111111111111ed1D73f860F57b2798b683f2d325',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://1786218689-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F4OftjbgGWmJOiwFRkFKr%2Fuploads%2FxBkrBV3R1T4fxCWIY2qJ%2Fyusdtoken.png?alt=media&token=a5acaa5c-a32b-480e-930b-5bd3def36adc',
    website: 'https://yeti.finance/',
    description:
      'The best borrowing experience on Avalanche. Borrow against your entire Avalanche portfolio interest-free.',
  },
  axlATOM: {
    name: 'Axelar Wrapped ATOM',
    symbol: 'ATOM',
    address: '0x80D18b1c9Ab0c9B5D6A6d5173575417457d00a12',
    chainId: 43114,
    decimals: 6,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png',
    website: 'https://cosmos.network/',
    description:
      'The Internet of Blockchains. Cosmos is an ever-expanding ecosystem of interconnected apps and services, built for a decentralized future.',
  },
  LOST: {
    name: 'Lost Worlds LOST',
    symbol: 'LOST',
    address: '0x449674B82F05d498E126Dd6615a1057A9c088f2C',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x449674B82F05d498E126Dd6615a1057A9c088f2C/logo.png',
    website: 'https://lostworlds.io/',
    description:
      'Lost Worlds is a 1st of its kind NFT platform experience where NFTs are geographically bound to real world locations for collectors to discover and mint.',
  },
  AVAXL: {
    name: 'Top Shelf AVAX L-Token',
    symbol: 'AVAXL',
    address: '0xe0237F9E2aaABd7Ffb8630BE5203D573a045Bca7',
    chainId: 43114,
    decimals: 18,
    website: 'https://topshelf.finance/',
    description:
      'Mint fully decentralized sythentic assets on Binance Smart Chain, Fantom & Avalanche.',
    logoURI: '',
  },
  MONEY: {
    name: 'Moremoney USD',
    symbol: 'MONEY',
    address: '0x0f577433Bf59560Ef2a79c124E9Ff99fCa258948',
    chainId: 43114,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/24237/large/money.png',
    website: 'https://moremoney.finance/',
    description:
      'Moremoney is a protocol for borrowing stablecoin while earning interest on liquidity pool tokens and other collateral assets.',
  },
  USTw: {
    name: 'TerraUSD (Wormhole)',
    symbol: 'USTw',
    address: '0xb599c3590F42f8F995ECfa0f85D2980B76862fc1',
    chainId: 43114,
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11/logo.png',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
  saUSDC: {
    name: 'Stargate USD Coin LP',
    address: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
    symbol: 'saUSDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 43114,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
  },
  saUSDT: {
    name: 'Stargate Tether USD LP',
    symbol: 'saUSDT',
    address: '0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c',
    chainId: 43114,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  STG: {
    name: 'Stargate',
    symbol: 'STG',
    address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590/logo.png',
    website: 'https://stargate.finance/',
    description:
      'Stargate is a community-driven organization building the first fully composable native asset bridge, and the first dApp built on LayerZero.',
  },
  FLY: {
    name: 'Hoppers Game FLY',
    symbol: 'FLY',
    address: '0x78Ea3fef1c1f07348199Bf44f45b803b9B0Dbe28',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x78Ea3fef1c1f07348199Bf44f45b803b9B0Dbe28/logo.png',
    website: 'https://hoppersgame.io/',
    description:
      'Hoppers Game is an idle game where players stake their Hopper NFTs in different adventures to earn $FLY.',
  },
  APE: {
    name: 'ApeCoin APE',
    symbol: 'APE',
    address: '0x0802d66f029c46E042b74d543fC43B6705ccb4ba',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x0802d66f029c46E042b74d543fC43B6705ccb4ba/logo.png',
    website: 'https://apecoin.com/',
    description:
      'ApeCoin is the APE Ecosystems governance token, allowing token holders to participate in ApeCoin DAO and giving its participants a shared and open currency that can be used without centralized intermediaries.',
  },
  DEG: {
    name: 'DegisToken',
    symbol: 'DEG',
    address: '0x9f285507Ea5B4F33822CA7aBb5EC8953ce37A645',
    chainId: 43114,
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/18840.png',
    website: 'https://degis.io/',
    description:
      'Blockchain is miserable, where risk and reward are widely extended. DEGIS is the shield to protect you. With innovative protection products, DEGIS is attractive to both on-chain and off-chain buyers.',
  },
  EGG: {
    name: 'Chikn Egg',
    symbol: 'EGG',
    address: '0x7761E2338B35bCEB6BdA6ce477EF012bde7aE611',
    chainId: 43114,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/21811/large/EggToken_200_Transparent.png',
    website: 'https://chikn.farm/',
    description: 'Chikn is an ecosystem based around NFTs that lay EGGs.',
  },
  FEED: {
    name: 'Chikn Feed',
    symbol: 'FEED',
    address: '0xab592d197ACc575D16C3346f4EB70C703F308D1E',
    chainId: 43114,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/22417/large/bJIvBemg_400x400.jpg',
    website: 'https://chikn.farm/',
    description: 'Chikn is an ecosystem based around NFTs that lay EGGs.',
  },
  ECD: {
    name: 'Echidna ECD',
    symbol: 'ECD',
    address: '0xeb8343D5284CaEc921F035207ca94DB6BAaaCBcd',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xeb8343d5284caec921f035207ca94db6baaacbcd/logo.png',
    website: 'https://www.echidna.finance/',
    description:
      'Echidna Finance is the ultimate yield boosting protocol for Platypus Finance, Avalanches native stableswap.',
  },
  VTX: {
    name: 'Vector',
    symbol: 'VTX',
    address: '0x5817D4F0b62A59b17f75207DA1848C2cE75e7AF4',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x5817D4F0b62A59b17f75207DA1848C2cE75e7AF4/logo.png',
    website: 'https://vectorfinance.io/',
    description:
      'Vector allows users to deposit stablecoins and earn boosted yield from the Platypus platform, without having to stake their PTP and worry about accruing vePTP.',
  },
  PAE: {
    name: 'Ripae',
    symbol: 'PAE',
    address: '0x9466Ab927611725B9AF76b9F31B2F879Ff14233d',
    chainId: 43114,
    decimals: 18,
    website: 'https://ripae.finance/',
    description:
      'Ripae Finances full focus is to build a true cross-chain algorithmic stable coin protocol that is stabilized with true use-cases all around the DeFi Ecosystem.',
    logoURI: 'https://avax.ripae.finance/static/media/ripae_pftm.3832b2f1.svg',
  },
  pAVAX: {
    name: 'pAVAX',
    symbol: 'pAVAX',
    address: '0x6ca558bd3eaB53DA1B25aB97916dd14bf6CFEe4E',
    chainId: 43114,
    decimals: 18,
    website: 'https://ripae.finance/',
    description:
      'Ripae Finances full focus is to build a true cross-chain algorithmic stable coin protocol that is stabilized with true use-cases all around the DeFi Ecosystem.',
    logoURI: 'https://avax.ripae.finance/static/media/ripae_pae.e914457b.svg',
  },
  FIEF: {
    name: 'Fief FIEF',
    symbol: 'FIEF',
    address: '0x65Def5029A0e7591e46B38742bFEdd1Fb7b24436',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xeA068Fba19CE95f12d252aD8Cb2939225C4Ea02D/logo.png',
    website: 'https://fief.finance/',
    description:
      'Fief is the economic guild of the metaverse with the primary objectives to acquire key assets from across the metaverse and drive the value of those assets through the combination of a highly-gamified guild faction system and decentralized protocols.',
  },
  BRIBE: {
    name: 'Police & Thief Game BRIBE',
    symbol: 'BRIBE',
    address: '0xCe2fbed816E320258161CeD52c2d0CEBcdFd8136',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xCe2fbed816E320258161CeD52c2d0CEBcdFd8136/logo.png',
    website: 'https://policeandthief.game/',
    description:
      'BRIBE represents the latest token rollout in the Tri-Token Tokenomics of the police & thief game.',
  },
  TUS: {
    name: 'Treasure Under Sea TUS',
    symbol: 'TUS',
    address: '0xf693248F96Fe03422FEa95aC0aFbBBc4a8FdD172',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xf693248F96Fe03422FEa95aC0aFbBBc4a8FdD172/logo.png',
    website: 'https://crabada.com',
    description:
      'TUS is the in-game currency earned via playing the game in the form of Mining, Looting and Lending Crabada via the Tavern.',
  },
  ACRE: {
    name: 'Arable Protocol ACRE',
    symbol: 'ACRE',
    address: '0x00EE200Df31b869a321B10400Da10b561F3ee60d',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0x00EE200Df31b869a321B10400Da10b561F3ee60d/logo.png',
    website: 'https://www.arablefi.com/',
    description:
      'Arable is a synthetic yield farming protocol that is dedicated to helping yield farmers access multiple blockchains (such as Ethereum, Avalanche, Solana, or Polygon) assets and yields on a single chain.',
  },
  FIRE: {
    name: 'The Phoenix FIRE',
    symbol: 'FIRE',
    address: '0xfcc6CE74f4cd7eDEF0C5429bB99d38A3608043a5',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xfcc6CE74f4cd7eDEF0C5429bB99d38A3608043a5/logo.png',
    website: 'https://thephoenix.finance/',
    description:
      'Phoenix Community Capital is a community investment project focused on using a shared asset pool to perform on-chain and off-chain investments into yield bearing instruments.',
  },
  sAVAX: {
    name: 'Staked Avax',
    symbol: 'sAVAX',
    address: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE/logo.png',
    website: 'https://benqi.fi/',
    description:
      'BENQI Liquid Staking is a protocol enabling users to stake AVAX to receive sAVAX, an interest bearing version of AVAX',
  },
  LUNA: {
    name: 'Axelar Wrapped LUNA',
    symbol: 'LUNA',
    address: '0x120AD3e5A7c796349e591F1570D9f7980F4eA9cb',
    chainId: 43114,
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0x120AD3e5A7c796349e591F1570D9f7980F4eA9cb/logo.png',
    website: 'https://www.terra.money/',
    description:
      'The Terra protocols native staking token that absorbs the price volatility of Terra. Luna is used for governance and in mining. Users stake Luna to validators who record and verify transactions on the blockchain in exchange for rewards from transaction fees. The more Terra is used, the more Luna is worth.',
  },
  DOMI: {
    name: 'DOMI Online DOMI',
    symbol: 'DOMI',
    address: '0xFc6Da929c031162841370af240dEc19099861d3B',
    chainId: 43114,
    decimals: 6,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xFc6Da929c031162841370af240dEc19099861d3B/logo.png',
    website: 'https://domionline.io/',
    description: 'Domi Online is a play to earn 3D Blockchain MMORPG underpinned by NFTs.',
  },
  LOOT: {
    name: 'Police and Thief Game LOOT',
    symbol: 'LOOT',
    address: '0x7f041ce89A2079873693207653b24C15B5e6A293',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0x7f041ce89A2079873693207653b24C15B5e6A293/logo.png',
    website: 'https://policeandthief.game/',
    description:
      'Police and Thief Game is a NFT P2E game on Avalanche, a Wolf Game derivative. The game incorporates probability based derivatives and decision making possibilities to allow players to make various decisions to come out on top.',
  },
  WINE: {
    name: 'WINE',
    symbol: 'WINE',
    address: '0xC55036B5348CfB45a932481744645985010d3A44',
    chainId: 43114,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/22739/small/gshare.png',
    website: 'https://grapefinance.app/',
    description: 'GRAPE is an algorithmic stable coin designed to maintain a 1:1 peg to MIM.',
  },
  GRAPE: {
    name: 'GRAPE',
    symbol: 'GRAPE',
    address: '0x5541D83EFaD1f281571B343977648B75d95cdAC2',
    chainId: 43114,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/22718/small/grape.png',
    website: 'https://grapefinance.app/',
    description: 'GRAPE is an algorithmic stable coin designed to maintain a 1:1 peg to MIM.',
  },
  DCAU: {
    name: 'Dragon Crypto Aurum DCAU',
    symbol: 'DCAU',
    address: '0x100Cc3a819Dd3e8573fD2E46D1E66ee866068f30',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x100Cc3a819Dd3e8573fD2E46D1E66ee866068f30/logo.png',
    website: 'https://aurum.dragoncrypto.io/',
    description:
      'Dragon Crypto Gaming (DCG), a Game-Fi platform which offers NFTs, play-to-earn games and yield farming.',
  },
  HEC: {
    name: 'HeroesChained HEC',
    symbol: 'HEC',
    address: '0xC7f4debC8072e23fe9259A5C0398326d8EfB7f5c',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xC7f4debC8072e23fe9259A5C0398326d8EfB7f5c/logo.png',
    website: 'https://heroeschained.com/',
    description:
      'Heroes Chained is a fantasy action RPG game, where the player becomes a Guild Master and gathers heroes.',
  },
  COOK: {
    name: 'Cook COOK',
    symbol: 'COOK',
    address: '0x637afeff75ca669fF92e4570B14D6399A658902f',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0x637afeff75ca669fF92e4570B14D6399A658902f/logo.png',
    website: 'https://app.cook.finance/',
    description:
      'Cook Protocol establishes a transparent and flexible asset management platform suited to diverse investors and asset management service providers alike.',
  },
  UST: {
    name: 'Axelar Wrapped UST',
    symbol: 'UST',
    address: '0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11',
    chainId: 43114,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11.svg',
    website: 'https://www.terra.money/',
    description:
      'Terra stablecoins offer instant settlements, low fees and seamless cross-border exchange - loved by millions of users and merchants.',
  },
  MORE: {
    name: 'More Token',
    symbol: 'MORE',
    address: '0xd9D90f882CDdD6063959A9d837B05Cb748718A05',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xd9D90f882CDdD6063959A9d837B05Cb748718A05.svg',
    website: 'https://app.moremoney.finance/',
    description:
      'Moremoney is a lending protocol for opening interest-free collateralised debt positions (CDP) using liquidity pool tokens, interest-bearing tokens (ibTKNs) and other major tokens as collateral. Borrowers mint MONEY, a USD softly pegged stablecoin backed by an over-collateralised debt position as well as the yield earned by the collateral.  After minting MONEY, borrowers can use it across the DeFi landscape, for interest free leverage, or simply use it to farm MORE. Moremoney is designed to support the further conversion of base tokens like ETH, AVAX, USDT into ibTKNs. Upon depositing, collateral assets are forwarded to trusted partner protocols where these tokens earn yield, which is either compounded into collateral token or into $MONEY to automatically repay debts owed by a vault.',
  },
  GMX: {
    name: 'GMX',
    symbol: 'GMX',
    address: '0x62edc0692BD897D2295872a9FFCac5425011c661',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x62edc0692BD897D2295872a9FFCac5425011c661.svg',
    website: 'https://gmx.io/buy',
    description: 'Swaps and leverage trading of up to 30x is now live on Avalanche!',
  },
  FRM: {
    name: 'Ferrum Network Token',
    symbol: 'FRM',
    address: '0xE5CAeF4Af8780E59Df925470b050Fb23C43CA68C',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xE5CAeF4Af8780E59Df925470b050Fb23C43CA68C.svg',
    website: 'https://ferrum.network/',
    description:
      'Ferrum Network is a cross-chain Blockchain as a Service DeFi company that specializes in adding deflationary token utility and advisory services to projects across the crypto space. With the mission of breaking down barriers to mass adoption in mind, Ferrum builds white-label blockchain solutions that empower startups and established organizations, enabling them to get their core products to market faster.Become Cross-Chain Compatible Today',
  },
  JEWEL: {
    chainId: 43114,
    address: '0x4f60a160D8C2DDdaAfe16FCC57566dB84D674BD6',
    decimals: 18,
    name: 'DeFi Kingdoms',
    symbol: 'JEWEL',
    website: 'https://defikingdoms.com/',
    description:
      'JEWEL is the governance token that powers DeFi Kingdoms which can be used to purchase NFTs such as items, heroes, and kingdoms. Holders can also stake them into liquidity mining pools to earn a yield from the protocol.',
    logoURI: 'https://assets.coingecko.com/coins/images/18570/large/fAisLIV.png?1632449282',
  },
  gOHM: {
    chainId: 43114,
    address: '0x321E7092a180BB43555132ec53AaA65a5bF84251',
    decimals: 18,
    name: 'Governance OHM',
    symbol: 'gOHM',
    website: 'https://www.olympusdao.finance/',
    description:
      'Olympus is building a community-owned decentralized financial infrastructure to bring more stability and transparency for the world.',
    logoURI:
      'https://assets.coingecko.com/coins/images/14483/large/token_OHM_%281%29.png?1628311611',
  },
  QI: {
    chainId: 43114,
    address: '0xA56F9A54880afBc30CF29bB66d2D9ADCdcaEaDD6',
    decimals: 18,
    name: 'Qi Dao',
    symbol: 'QI',
    website: 'https://www.mai.finance/',
    description:
      'Qi (pronounced CHEE) is the governance token of the QiDao Protocol. It allows those who hold it to vote on changes to the QiDao Protocol.',
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/qi.png',
  },
  BOO: {
    chainId: 43114,
    address: '0xbD83010eB60F12112908774998F65761cf9f6f9a',
    decimals: 18,
    name: 'Spooky Token',
    symbol: 'BOO',
    website: 'https://spookyswap.finance/',
    description:
      "SpookySwap is an automated market-making (AMM) decentralized exchange (DEX) for the Fantom Opera network. Different from other DEXs, we're invested in building a strong foundation with our BOO token as a governance token, diverse farms, grants to encourage a healthy ecology of other Fantom projects, and user-centered service.",
    logoURI: 'https://assets.spookyswap.finance/tokens/BOO.png',
  },
  BLZZ: {
    chainId: 43114,
    address: '0x0f34919404a290e71fc6A510cB4a6aCb8D764b24',
    decimals: 18,
    name: 'BLIZZ',
    symbol: 'BLZZ',
    website: 'https://blizz.finance/',
    description:
      'Blizz is a decentralised non-custodial liquidity market protocol where users can participate as depositors or borrowers.',
    logoURI: 'https://pbs.twimg.com/profile_images/1456581025392377856/FEA_z1P0_x96.jpg',
  },
  CRV: {
    chainId: 43114,
    address: '0x47536F17F4fF30e64A96a7555826b8f9e66ec468',
    decimals: 18,
    name: 'Curve',
    symbol: 'CRV',
    website: 'https://curve.fi/',
    description:
      'Curve is an exchange liquidity pool on Ethereum. Curve is designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost.',
    logoURI: 'https://external-content.duckduckgo.com/ip3/resources.curve.fi.ico',
  },
  aSING: {
    chainId: 43114,
    address: '0xF9A075C9647e91410bF6C402bDF166e1540f67F0',
    decimals: 18,
    name: 'Sing Token',
    symbol: 'SING',
    website: 'https://singular.farm/',
    description:
      'Singular is a multichain, decentralized, strategic yield farm running on Polygon, BSC, Fantom and Okchain. Users are incentivized with a triple farming system.',
    logoURI: 'https://github.com/singularfarm/assets/blob/main/400.png?raw=true',
  },
  TEDDY: {
    chainId: 43114,
    address: '0x094bd7B2D99711A1486FB94d4395801C6d0fdDcC',
    decimals: 18,
    name: 'TEDDY',
    symbol: 'TEDDY',
    website: 'https://teddy.cash/',
    description:
      'TEDDY is a token that captures the fee revenue generated by the Teddy Cash Protocol via staking. Teddy Cash is a decentralized borrowing protocol that allows you to draw 0% interest loans against AVAX used as collateral.',
    logoURI: 'https://teddy.cash/teddy-cash-final.png',
  },
  TSD: {
    chainId: 43114,
    address: '0x4fbf0429599460D327BD5F55625E30E4fC066095',
    decimals: 18,
    name: 'TSD Stablecoin',
    symbol: 'TSD',
    website: 'https://teddy.cash/',
    description:
      'The Teddy Dollar (TSD) is the first stablecoin on the Avalanche network that uses AVAX as collateral.',
    logoURI: 'https://app.teddy.cash/tsd.png',
  },
  TIME: {
    chainId: 43114,
    address: '0xb54f16fB19478766A268F172C9480f8da1a7c9C3',
    decimals: 9,
    name: 'Time',
    symbol: 'TIME',
    website: 'https://app.wonderland.money/#/stake',
    description:
      'Wonderland is the first decentralized reserve currency protocol available on the Avalanche Network based on the TIME token. Each TIME token is backed by a basket of assets (e.g., MIM, TIME-AVAX LP Tokens etc etc) in the Wonderland treasury, giving it an intrinsic value that it cannot fall below. Wonderland also introduces economic and game-theoretic dynamics into the market through staking and bonding.',
    logoURI:
      'https://gblobscdn.gitbook.com/assets%2F-MhzA-YXhEZ1wM1iWJEo%2F-MiQzpjkumrqycMXcTj6%2F-MiR0TC116IqSmoKpkwX%2FTime%20Token.png?alt=media&token=9ba1004c-5e23-4e6e-b4f8-19f109c557d0',
  },
  AMPL: {
    chainId: 43114,
    address: '0x027dbcA046ca156De9622cD1e2D907d375e53aa7',
    decimals: 9,
    name: 'Ampleforth secured by Meter Passport',
    symbol: 'AMPL',
    website: 'https://www.ampleforth.org/',
    description:
      'Meter Passport is a N-way blockchain router that allows assets and information to flow directly from one blockchain to another within minutes or even seconds',
    logoURI: 'https://cryptologos.cc/logos/ampleforth-ampl-logo.png',
  },
  MAI: {
    chainId: 43114,
    address: '0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b',
    decimals: 18,
    name: 'Mai Stablecoin',
    symbol: 'MAI',
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stable coin collateralized by your MATIC holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png',
  },
  miMatic: {
    chainId: 43114,
    address: '0x3B55E45fD6bd7d4724F5c47E0d1bCaEdd059263e',
    decimals: 18,
    name: 'MiMatic',
    symbol: 'MAI',
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stable coin collateralized by your MATIC holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png',
  },
  aQI: {
    chainId: 43114,
    address: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
    decimals: 18,
    name: 'BenQi',
    symbol: 'QI',
    website: 'https://app.benqi.fi/overview',
    description: 'BenQI is lending protocol on the Avalanche blockchain',
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5/logo.png',
  },
  BIFI: {
    chainId: 43114,
    address: '0xd6070ae98b8069de6B494332d1A1a81B6179D960',
    decimals: 18,
    name: 'Binance Smart Chain',
    symbol: 'BIFI',
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  BNB: {
    chainId: 43114,
    address: '0x264c1383EA520f73dd837F915ef3a732e204a493',
    decimals: 18,
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
  },
  PNG: {
    chainId: 43114,
    address: '0x60781C2586D68229fde47564546784ab3fACA982',
    decimals: 18,
    name: 'Pangolin',
    symbol: 'PNG',
    website: 'https://pangolin.exchange/',
    description:
      'Pangolin is a community-driven decentralized exchange for Avalanche and Ethereum assets with fast settlement, low transaction fees, and a democratic distribution–powered by Avalanche.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x60781C2586D68229fde47564546784ab3fACA982/logo.png',
  },
  AVAX,
  WAVAX: AVAX,
  WNATIVE: AVAX,
  ETH: {
    chainId: 43114,
    address: '0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15/logo.png',
  },
  WETHe: {
    chainId: 43114,
    address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15/logo.png',
  },
  POOLZ: {
    chainId: 43114,
    address: '0x96CE026f10890f4836937e6FDe75f13252fdf414',
    decimals: 18,
    name: 'Poolz Finance',
    symbol: 'POOLZ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x96CE026f10890f4836937e6FDe75f13252fdf414/logo.png',
  },
  ROPE: {
    chainId: 43114,
    address: '0xa99DFda608D5c9E7f091e857EfB256cEDA48D57e',
    decimals: 18,
    name: 'ROPE',
    symbol: 'ROPE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa99DFda608D5c9E7f091e857EfB256cEDA48D57e/logo.png',
  },
  ZRX: {
    chainId: 43114,
    address: '0xC8E94215b75F5B9c3b5fB041eC3A97B7D17a37Ff',
    decimals: 18,
    name: '0x Protocol Token',
    symbol: 'ZRX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC8E94215b75F5B9c3b5fB041eC3A97B7D17a37Ff/logo.png',
  },
  '0xMR': {
    chainId: 43114,
    address: '0xC309fd43f845A46AA2A4C75459b076543C6E9F4a',
    decimals: 18,
    name: '0xMonero',
    symbol: '0xMR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC309fd43f845A46AA2A4C75459b076543C6E9F4a/logo.png',
  },
  '1INCH': {
    chainId: 43114,
    address: '0xE54EB2C3009Fa411BF24fB017F9725b973CE36F0',
    decimals: 18,
    name: '1INCH Token',
    symbol: '1INCH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE54EB2C3009Fa411BF24fB017F9725b973CE36F0/logo.png',
  },
  MPH: {
    chainId: 43114,
    address: '0xa477b670C46fe58cF48708D9519a5E8875a48062',
    decimals: 18,
    name: '88mph.app',
    symbol: 'MPH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa477b670C46fe58cF48708D9519a5E8875a48062/logo.png',
  },
  AAVEe: {
    chainId: 43114,
    address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9',
    decimals: 18,
    name: 'Aave Token',
    symbol: 'AAVE',
    website: 'https://app.aave.com/markets',
    description:
      'Aave is a decentralised non-custodial liquidity market protocol where users can participate as depositors or borrowers.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9/logo.png',
  },
  AAVE: {
    chainId: 43114,
    address: '0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9',
    decimals: 18,
    name: 'Aave Token',
    symbol: 'AAVE',
    website: 'https://app.aave.com/markets',
    description:
      'Aave is a decentralised non-custodial liquidity market protocol where users can participate as depositors or borrowers.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8cE2Dee54bB9921a2AE0A63dBb2DF8eD88B91dD9/logo.png',
  },
  ABYSS: {
    chainId: 43114,
    address: '0x2C4Ac7ABe6D09F81a775DE153E5593c8C56884eb',
    decimals: 18,
    name: 'ABYSS',
    symbol: 'ABYSS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2C4Ac7ABe6D09F81a775DE153E5593c8C56884eb/logo.png',
  },
  AceD: {
    chainId: 43114,
    address: '0x0A15ed1B1F1BE0b2024b4d22B4f19Ebb99A6fd11',
    decimals: 18,
    name: 'AceD',
    symbol: 'AceD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0A15ed1B1F1BE0b2024b4d22B4f19Ebb99A6fd11/logo.png',
  },
  ADX: {
    chainId: 43114,
    address: '0xEdd6ce14626B228D90aF0fB126a432e4b2174844',
    decimals: 18,
    name: 'AdEx Network',
    symbol: 'ADX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xEdd6ce14626B228D90aF0fB126a432e4b2174844/logo.png',
  },
  AGRI: {
    chainId: 43114,
    address: '0xcc6421b76190b5e7D1029824F6C988456C798291',
    decimals: 18,
    name: 'AgriChain Utility Token',
    symbol: 'AGRI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xcc6421b76190b5e7D1029824F6C988456C798291/logo.png',
  },
  AID: {
    chainId: 43114,
    address: '0x2e1Bc9fA6F579471e7e09084a054a858d792D981',
    decimals: 18,
    name: 'AidCoin',
    symbol: 'AID',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2e1Bc9fA6F579471e7e09084a054a858d792D981/logo.png',
  },
  AKRO: {
    chainId: 43114,
    address: '0x086A23685F2A33BfdeDF4dEd738e9afDdfb854Ed',
    decimals: 18,
    name: 'Akropolis',
    symbol: 'AKRO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x086A23685F2A33BfdeDF4dEd738e9afDdfb854Ed/logo.png',
  },
  ADEL: {
    chainId: 43114,
    address: '0x98E1cF8b9D1DEb2F0C9F2a0A59Ee2fB60a6F10C9',
    decimals: 18,
    name: 'Akropolis Delphi',
    symbol: 'ADEL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x98E1cF8b9D1DEb2F0C9F2a0A59Ee2fB60a6F10C9/logo.png',
  },
  ALEPH: {
    chainId: 43114,
    address: '0x969A3f4481583843dB706332E344412235c0892a',
    decimals: 18,
    name: 'aleph.im v2',
    symbol: 'ALEPH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x969A3f4481583843dB706332E344412235c0892a/logo.png',
  },
  ALBT: {
    chainId: 43114,
    address: '0xC0c9b6714a482AAD7b11327cCf4d7a0545A828a5',
    decimals: 18,
    name: 'AllianceBlock Token',
    symbol: 'ALBT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC0c9b6714a482AAD7b11327cCf4d7a0545A828a5/logo.png',
  },
  ALPHA: {
    chainId: 43114,
    address: '0x8Ea071D1903B27Ee57c82710B3a7cF660f285Bb8',
    decimals: 18,
    name: 'AlphaToken',
    symbol: 'ALPHA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8Ea071D1903B27Ee57c82710B3a7cF660f285Bb8/logo.png',
  },
  AMN: {
    chainId: 43114,
    address: '0xC95F62A06BA7Fb11389474EE1d4aA606A2A0D125',
    decimals: 18,
    name: 'Amon',
    symbol: 'AMN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC95F62A06BA7Fb11389474EE1d4aA606A2A0D125/logo.png',
  },
  AMP: {
    chainId: 43114,
    address: '0x74A13926Df3e38a7BB7D12f566694f2E66Ba145E',
    decimals: 18,
    name: 'Amp',
    symbol: 'AMP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x74A13926Df3e38a7BB7D12f566694f2E66Ba145E/logo.png',
  },
  ANKR: {
    chainId: 43114,
    address: '0xd09Af6A3C12EC24CeD114A0829F5Bf73D40dC5A8',
    decimals: 18,
    name: 'Ankr Network',
    symbol: 'ANKR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd09Af6A3C12EC24CeD114A0829F5Bf73D40dC5A8/logo.png',
  },
  ANRX: {
    chainId: 43114,
    address: '0x68Fa782392ff75689b6EE6E1559de2Afc634DCe8',
    decimals: 18,
    name: 'AnRKey X',
    symbol: 'ANRX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x68Fa782392ff75689b6EE6E1559de2Afc634DCe8/logo.png',
  },
  API3: {
    chainId: 43114,
    address: '0xBf853B96F95Fae6883E9cBC813B4021FCcF1eED4',
    decimals: 18,
    name: 'API3',
    symbol: 'API3',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBf853B96F95Fae6883E9cBC813B4021FCcF1eED4/logo.png',
  },
  APY: {
    chainId: 43114,
    address: '0x524CefBaD8aa1e7921d465A9f056fc52FF6a284F',
    decimals: 18,
    name: 'APY Governance Token',
    symbol: 'APY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x524CefBaD8aa1e7921d465A9f056fc52FF6a284F/logo.png',
  },
  ANT: {
    chainId: 43114,
    address: '0x6C67e7D38570d6c7FFFdbB930cF204D97C62C470',
    decimals: 18,
    name: 'Aragon Network Token',
    symbol: 'ANT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6C67e7D38570d6c7FFFdbB930cF204D97C62C470/logo.png',
  },
  ASKO: {
    chainId: 43114,
    address: '0xaDCfCb796ab61Ebcd0676c6B6e13a270Fd55b402',
    decimals: 18,
    name: 'Askobar Network',
    symbol: 'ASKO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xaDCfCb796ab61Ebcd0676c6B6e13a270Fd55b402/logo.png',
  },
  ASTRO: {
    chainId: 43114,
    address: '0xaDA58D37D13EF5B665C46e474ac4D1AEf12EBdB1',
    decimals: 18,
    name: 'AstroTools.io',
    symbol: 'ASTRO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xaDA58D37D13EF5B665C46e474ac4D1AEf12EBdB1/logo.png',
  },
  ATIS: {
    chainId: 43114,
    address: '0x77619878ccDd644Dd5e67cA0f8F04Dfaae42D542',
    decimals: 18,
    name: 'ATIS Token',
    symbol: 'ATIS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x77619878ccDd644Dd5e67cA0f8F04Dfaae42D542/logo.png',
  },
  AUC: {
    chainId: 43114,
    address: '0xAeaDfDc09c284E848aeBA876FF086Ed06A95B4b2',
    decimals: 18,
    name: 'Auctus Token',
    symbol: 'AUC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xAeaDfDc09c284E848aeBA876FF086Ed06A95B4b2/logo.png',
  },
  AUDIO: {
    chainId: 43114,
    address: '0x8e32F45c87b39F15529787A77cFa7bA48CFAC7f0',
    decimals: 18,
    name: 'Audius',
    symbol: 'AUDIO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8e32F45c87b39F15529787A77cFa7bA48CFAC7f0/logo.png',
  },
  AXS: {
    chainId: 43114,
    address: '0x860d87C4EE3bf2F001a641e32FbeF8F0342Ba924',
    decimals: 18,
    name: 'Axie Infinity Shard',
    symbol: 'AXS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x860d87C4EE3bf2F001a641e32FbeF8F0342Ba924/logo.png',
  },
  BAC: {
    chainId: 43114,
    address: '0x17002A182B20F7a393808c5E013EC5fe770C9302',
    decimals: 18,
    name: 'BAC',
    symbol: 'BAC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x17002A182B20F7a393808c5E013EC5fe770C9302/logo.png',
  },
  BAL: {
    chainId: 43114,
    address: '0xA2A035Dd93b0e963864FA14A240401d6CeAc5558',
    decimals: 18,
    name: 'Balancer',
    symbol: 'BAL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA2A035Dd93b0e963864FA14A240401d6CeAc5558/logo.png',
  },
  BNT: {
    chainId: 43114,
    address: '0xeD44979561a797515767B0201121afC4b5eE2838',
    decimals: 18,
    name: 'Bancor Network Token',
    symbol: 'BNT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xeD44979561a797515767B0201121afC4b5eE2838/logo.png',
  },
  USDB: {
    chainId: 43114,
    address: '0x764CC68cd46cB00644216682C3ee120b2f1EB5F6',
    decimals: 18,
    name: 'Bancor USD Token',
    symbol: 'USDB',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x764CC68cd46cB00644216682C3ee120b2f1EB5F6/logo.png',
  },
  BAND: {
    chainId: 43114,
    address: '0x6Fd02c0789797e595751208a2446faF721B9f3C2',
    decimals: 18,
    name: 'BandToken',
    symbol: 'BAND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6Fd02c0789797e595751208a2446faF721B9f3C2/logo.png',
  },
  VLT: {
    chainId: 43114,
    address: '0xd02D849512780BF29Cf48D56900a4B025e478D3E',
    decimals: 18,
    name: 'Bankroll Vault',
    symbol: 'VLT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd02D849512780BF29Cf48D56900a4B025e478D3E/logo.png',
  },
  BAO: {
    chainId: 43114,
    address: '0x353Be78373b6b75B5A61d952fccCb95C1d3e0bc8',
    decimals: 18,
    name: 'BaoToken',
    symbol: 'BAO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x353Be78373b6b75B5A61d952fccCb95C1d3e0bc8/logo.png',
  },
  BOND: {
    chainId: 43114,
    address: '0x59Cd8bb3E49930F313eD744585E4067bc45cF85d',
    decimals: 18,
    name: 'BarnBridge Governance Token',
    symbol: 'BOND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x59Cd8bb3E49930F313eD744585E4067bc45cF85d/logo.png',
  },
  BAS: {
    chainId: 43114,
    address: '0x3f4409c13C3BB310317643C6ee15576b3d427Ddd',
    decimals: 18,
    name: 'BAS',
    symbol: 'BAS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3f4409c13C3BB310317643C6ee15576b3d427Ddd/logo.png',
  },
  BAT: {
    chainId: 43114,
    address: '0x6b329326E0F6b95B93b52229b213334278D6f277',
    decimals: 18,
    name: 'Basic Attention Token',
    symbol: 'BAT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6b329326E0F6b95B93b52229b213334278D6f277/logo.png',
  },
  BCS: {
    chainId: 43114,
    address: '0xF7427e4A97f3c68fEbC6E6a90632c369524db9Ea',
    decimals: 18,
    name: 'BCS',
    symbol: 'BCS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF7427e4A97f3c68fEbC6E6a90632c369524db9Ea/logo.png',
  },
  BETR: {
    chainId: 43114,
    address: '0xa6c55D876E920e34203072891c720Ac19f425a2B',
    decimals: 18,
    name: 'Better Betting',
    symbol: 'BETR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa6c55D876E920e34203072891c720Ac19f425a2B/logo.png',
  },
  BUSD: {
    chainId: 43114,
    address: '0xaEb044650278731Ef3DC244692AB9F64C78FfaEA',
    decimals: 18,
    name: 'Binance USD',
    symbol: 'BUSD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xaEb044650278731Ef3DC244692AB9F64C78FfaEA/logo.png',
  },
  BIRD: {
    chainId: 43114,
    address: '0xC83F0172352692A4481dBf07Ddd9F0e3dC5c70D1',
    decimals: 18,
    name: 'Bird.Money',
    symbol: 'BIRD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC83F0172352692A4481dBf07Ddd9F0e3dC5c70D1/logo.png',
  },
  CAT: {
    chainId: 43114,
    address: '0x024fC8Fe444CFf7682499c08F5bb14241E082d49',
    decimals: 18,
    name: 'BitClave',
    symbol: 'CAT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x024fC8Fe444CFf7682499c08F5bb14241E082d49/logo.png',
  },
  BTSG: {
    chainId: 43114,
    address: '0xc5bac6dc06d1FC9F5eD7b0a04D08747b4c938B6d',
    decimals: 18,
    name: 'BitSong',
    symbol: 'BTSG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xc5bac6dc06d1FC9F5eD7b0a04D08747b4c938B6d/logo.png',
  },
  XBP: {
    chainId: 43114,
    address: '0x1F5AE9F37A18Aa6797cdb58838F2E05160082Ae7',
    decimals: 18,
    name: 'BlitzPredict',
    symbol: 'XBP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1F5AE9F37A18Aa6797cdb58838F2E05160082Ae7/logo.png',
  },
  BLY: {
    chainId: 43114,
    address: '0xEEE72b81fc4cf5A4bf9dC10c1d12F73C440ff7e9',
    decimals: 18,
    name: 'Blocery Token',
    symbol: 'BLY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xEEE72b81fc4cf5A4bf9dC10c1d12F73C440ff7e9/logo.png',
  },
  BCDT: {
    chainId: 43114,
    address: '0x57D4A335260af430F5e0754D99d20Da2f1528BdF',
    decimals: 18,
    name: 'Blockchain Certified Data Token',
    symbol: 'BCDT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x57D4A335260af430F5e0754D99d20Da2f1528BdF/logo.png',
  },
  VEE: {
    chainId: 43114,
    address: '0xFE017733FF7E4D2AE17C98B2774fB4d5E3EA46DD',
    decimals: 18,
    name: 'BLOCKv Token',
    symbol: 'VEE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xFE017733FF7E4D2AE17C98B2774fB4d5E3EA46DD/logo.png',
  },
  BLZ: {
    chainId: 43114,
    address: '0x6572450E88918154B6f059aa7fCAbA37f5ddc490',
    decimals: 18,
    name: 'Bluzelle Token',
    symbol: 'BLZ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6572450E88918154B6f059aa7fCAbA37f5ddc490/logo.png',
  },
  BONDLY: {
    chainId: 43114,
    address: '0xD61B293AEFb71f9B83670133d1FAad8487567a53',
    decimals: 18,
    name: 'Bondly Token',
    symbol: 'BONDLY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD61B293AEFb71f9B83670133d1FAad8487567a53/logo.png',
  },
  BOOST: {
    chainId: 43114,
    address: '0x7Ffc73532E29Ac0845E494ec021F1A0791EBd4A7',
    decimals: 18,
    name: 'Boosted Finance',
    symbol: 'BOOST',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7Ffc73532E29Ac0845E494ec021F1A0791EBd4A7/logo.png',
  },
  BOT: {
    chainId: 43114,
    address: '0x4AcEA0eB348a6DB49cb3F8A1D62625342D5f8751',
    decimals: 18,
    name: 'Bounce Token',
    symbol: 'BOT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4AcEA0eB348a6DB49cb3F8A1D62625342D5f8751/logo.png',
  },
  BTU: {
    chainId: 43114,
    address: '0x211960f8260DB1B0171c33931a2aeFd9562592B0',
    decimals: 18,
    name: 'BTU Protocol',
    symbol: 'BTU',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x211960f8260DB1B0171c33931a2aeFd9562592B0/logo.png',
  },
  CAP: {
    chainId: 43114,
    address: '0xb2Fb27f45189F3c621545e5E3aAe668A9B1BDf1d',
    decimals: 18,
    name: 'Cap',
    symbol: 'CAP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb2Fb27f45189F3c621545e5E3aAe668A9B1BDf1d/logo.png',
  },
  CTSI: {
    chainId: 43114,
    address: '0x71C677beD0DF55AF6d6b19114Dab10E1dE45d9F7',
    decimals: 18,
    name: 'Cartesi Token',
    symbol: 'CTSI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x71C677beD0DF55AF6d6b19114Dab10E1dE45d9F7/logo.png',
  },
  CBIX7: {
    chainId: 43114,
    address: '0xeeD4DcDFaE91D39d2b851338433F0013AF5D1406',
    decimals: 18,
    name: 'CBI Index 7',
    symbol: 'CBIX7',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xeeD4DcDFaE91D39d2b851338433F0013AF5D1406/logo.png',
  },
  LINK: {
    chainId: 43114,
    address: '0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651',
    decimals: 18,
    name: 'ChainLink Token',
    symbol: 'LINK',
    website: 'https://chain.link/',
    description:
      'Link is the currency used to pay the Chainlink node operators for their work. Chainlink node operators have to stake LINK in the network in order to participate and provide data services.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651/logo.png',
  },
  LINKe: {
    chainId: 43114,
    address: '0x5947BB275c521040051D82396192181b413227A3',
    decimals: 18,
    name: 'ChainLink Token',
    symbol: 'LINK',
    website: 'https://chain.link/',
    description:
      'Link is the currency used to pay the Chainlink node operators for their work. Chainlink node operators have to stake LINK in the network in order to participate and provide data services.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB3fe5374F67D7a22886A0eE082b2E2f9d2651651/logo.png',
  },

  COL: {
    chainId: 43114,
    address: '0xEFb603A7844f11D17aDA15B63e3A876AB443372C',
    decimals: 18,
    name: 'COL',
    symbol: 'COL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xEFb603A7844f11D17aDA15B63e3A876AB443372C/logo.png',
  },
  COMP: {
    chainId: 43114,
    address: '0x53CEedB4f6f277edfDDEdB91373B044FE6AB5958',
    decimals: 18,
    name: 'Compound',
    symbol: 'COMP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x53CEedB4f6f277edfDDEdB91373B044FE6AB5958/logo.png',
  },
  CVP: {
    chainId: 43114,
    address: '0xDF9A6628235C90da0a475519D85C9CFFa2a11D4C',
    decimals: 18,
    name: 'Concentrated Voting Power',
    symbol: 'CVP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xDF9A6628235C90da0a475519D85C9CFFa2a11D4C/logo.png',
  },
  NCASH: {
    chainId: 43114,
    address: '0xc69Eba65e87889f0805dB717Af06797055A0BA07',
    decimals: 18,
    name: 'NCash is the native cryptocurrency and protocol token of the Nitro Network. Nitro Network is building a world of private communication networks powered by IoT together with LoRaWAN/3G/4G and 5G.',
    symbol: 'NCASH',
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xc69Eba65e87889f0805dB717Af06797055A0BA07/logo_48.png',
  },
  COT: {
    chainId: 43114,
    address: '0xa8cE5107A2770959edB27529E56E84e11eF55a58',
    decimals: 18,
    name: 'CoTrader',
    symbol: 'COT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa8cE5107A2770959edB27529E56E84e11eF55a58/logo.png',
  },
  COVER: {
    chainId: 43114,
    address: '0xE0976dCa075C4055cADa33C2452429572885aE7E',
    decimals: 18,
    name: 'Cover Protocol',
    symbol: 'COVER',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE0976dCa075C4055cADa33C2452429572885aE7E/logo.png',
  },
  'COVER-Cover Protocol Governance Token': {
    chainId: 43114,
    address: '0xe35f68f3DE8590F3FD6884Eef166AF9f414D75F7',
    decimals: 18,
    name: 'Cover Protocol Governance Token',
    symbol: 'COVER',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xe35f68f3DE8590F3FD6884Eef166AF9f414D75F7/logo.png',
  },
  CREAM: {
    chainId: 43114,
    address: '0xb9AB39F9b4E3af0c97aE55EA48A960656C681A88',
    decimals: 18,
    name: 'Cream',
    symbol: 'CREAM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb9AB39F9b4E3af0c97aE55EA48A960656C681A88/logo.png',
  },
  cyUSD: {
    chainId: 43114,
    address: '0x3a9ea8880643211413609A7B717e3884816D15e7',
    decimals: 18,
    name: 'CreamY USD',
    symbol: 'cyUSD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3a9ea8880643211413609A7B717e3884816D15e7/logo.png',
  },
  XCHF: {
    chainId: 43114,
    address: '0x3E8a3b1db5401938F6F34E4e6f2560354C182c46',
    decimals: 18,
    name: 'CryptoFranc',
    symbol: 'XCHF',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3E8a3b1db5401938F6F34E4e6f2560354C182c46/logo.png',
  },
  CUDOS: {
    chainId: 43114,
    address: '0x422b2328A16b41ecCA56E1854be9943526aD7647',
    decimals: 18,
    name: 'CudosToken',
    symbol: 'CUDOS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x422b2328A16b41ecCA56E1854be9943526aD7647/logo.png',
  },
  CUR: {
    chainId: 43114,
    address: '0x06f9FD59D9E009E7e47a07Df79BC994A07dcFb95',
    decimals: 18,
    name: 'CurToken',
    symbol: 'CUR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x06f9FD59D9E009E7e47a07Df79BC994A07dcFb95/logo.png',
  },
  CORE: {
    chainId: 43114,
    address: '0x424587becE1A7436Ae4a38eD9E8686992236618B',
    decimals: 18,
    name: 'cVault.finance',
    symbol: 'CORE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x424587becE1A7436Ae4a38eD9E8686992236618B/logo.png',
  },
  CFi: {
    chainId: 43114,
    address: '0xd77b301D644608eE1E3dC56C3CF8540E6C9EC60F',
    decimals: 18,
    name: 'CyberFi Token',
    symbol: 'CFi',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd77b301D644608eE1E3dC56C3CF8540E6C9EC60F/logo.png',
  },
  DAI: {
    chainId: 43114,
    address: '0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a',
    decimals: 18,
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    website: 'https://makerdao.com/en/',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a/logo.png',
  },
  GEN: {
    chainId: 43114,
    address: '0x2263483B187d8C99d1E7D1f737183097c7071fe2',
    decimals: 18,
    name: 'DAOstack',
    symbol: 'GEN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2263483B187d8C99d1E7D1f737183097c7071fe2/logo.png',
  },
  DEBASE: {
    chainId: 43114,
    address: '0xA449DE69B549B416690aB15D2E67E7fCcD464347',
    decimals: 18,
    name: 'Debase',
    symbol: 'DEBASE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA449DE69B549B416690aB15D2E67E7fCcD464347/logo.png',
  },
  DEC: {
    chainId: 43114,
    address: '0xdC6D33821606f6c5FfceD7Bb315152210F3f31d9',
    decimals: 18,
    name: 'Decentr',
    symbol: 'DEC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xdC6D33821606f6c5FfceD7Bb315152210F3f31d9/logo.png',
  },
  MANA: {
    chainId: 43114,
    address: '0x332877d7b83D98eFC3e22C203c54E6e62F7f35e9',
    decimals: 18,
    name: 'Decentraland MANA',
    symbol: 'MANA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x332877d7b83D98eFC3e22C203c54E6e62F7f35e9/logo.png',
  },
  DIP: {
    chainId: 43114,
    address: '0xa571971CD50b3c17c9F82f43965319907D50341E',
    decimals: 18,
    name: 'Decentralized Insurance Protocol',
    symbol: 'DIP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa571971CD50b3c17c9F82f43965319907D50341E/logo.png',
  },
  DUSD: {
    chainId: 43114,
    address: '0x71645323F647488209eAAB8d08900576502160c8',
    decimals: 18,
    name: 'DefiDollar',
    symbol: 'DUSD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x71645323F647488209eAAB8d08900576502160c8/logo.png',
  },
  DFD: {
    chainId: 43114,
    address: '0x30EB0D35147B7a40dB1A54a98F25317E844670e5',
    decimals: 18,
    name: 'DefiDollar DAO',
    symbol: 'DFD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x30EB0D35147B7a40dB1A54a98F25317E844670e5/logo.png',
  },
  FIN: {
    chainId: 43114,
    address: '0x7FA965Ebd5bBBee983681E571091A31dDDB2E510',
    decimals: 18,
    name: 'DeFiner',
    symbol: 'FIN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7FA965Ebd5bBBee983681E571091A31dDDB2E510/logo.png',
  },
  PIE: {
    chainId: 43114,
    address: '0x8320c3cd3a0d671650F5600Cc9d907749AeDa7E1',
    decimals: 18,
    name: 'DeFiPIE Token',
    symbol: 'PIE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8320c3cd3a0d671650F5600Cc9d907749AeDa7E1/logo.png',
  },
  DPI: {
    chainId: 43114,
    address: '0x150DC9795908a27988aBf71C30E9B1647922A7B3',
    decimals: 18,
    name: 'DefiPulse Index',
    symbol: 'DPI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x150DC9795908a27988aBf71C30E9B1647922A7B3/logo.png',
  },
  DTH: {
    chainId: 43114,
    address: '0x5eC7E661fB06ccFBC371Fb463a284705D53DF32a',
    decimals: 18,
    name: 'Dether',
    symbol: 'DTH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5eC7E661fB06ccFBC371Fb463a284705D53DF32a/logo.png',
  },
  DEV: {
    chainId: 43114,
    address: '0xD7c26758CA255fb1d7559B02Ff36295be61f6822',
    decimals: 18,
    name: 'Dev',
    symbol: 'DEV',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD7c26758CA255fb1d7559B02Ff36295be61f6822/logo.png',
  },
  DEXE: {
    chainId: 43114,
    address: '0x5574eDff4EF9Fce15B22DDB37A7F419b2Abd729E',
    decimals: 18,
    name: 'Dexe',
    symbol: 'DEXE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5574eDff4EF9Fce15B22DDB37A7F419b2Abd729E/logo.png',
  },
  DEXT: {
    chainId: 43114,
    address: '0x618B994F06F7168bd3e24C05321cCf0Afd30D6bc',
    decimals: 18,
    name: 'DEXTools',
    symbol: 'DEXT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x618B994F06F7168bd3e24C05321cCf0Afd30D6bc/logo.png',
  },
  BUIDL: {
    chainId: 43114,
    address: '0x30D26864af10565CEdD9E4d5b1fdBd52B49144DD',
    decimals: 18,
    name: 'DFOHub',
    symbol: 'BUIDL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x30D26864af10565CEdD9E4d5b1fdBd52B49144DD/logo.png',
  },
  buidl: {
    chainId: 43114,
    address: '0x933753c297aDe672D68fa3296FdafFD76Db7DFA2',
    decimals: 18,
    name: 'dfohub',
    symbol: 'buidl',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x933753c297aDe672D68fa3296FdafFD76Db7DFA2/logo.png',
  },
  GOLDx: {
    chainId: 43114,
    address: '0xe3EDb25E952e9b3575EFb71DE14651EF3F2e8FaF',
    decimals: 18,
    name: 'dForce',
    symbol: 'GOLDx',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xe3EDb25E952e9b3575EFb71DE14651EF3F2e8FaF/logo.png',
  },
  DHT: {
    chainId: 43114,
    address: '0xeE33c5804b759cCf3A9de88c9E772374147dCdEE',
    decimals: 18,
    name: 'dHedge DAO Token',
    symbol: 'DHT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xeE33c5804b759cCf3A9de88c9E772374147dCdEE/logo.png',
  },
  DIA: {
    chainId: 43114,
    address: '0xd072dEcEb5FD919bF8853CeB1068438652a06c00',
    decimals: 18,
    name: 'DIAToken',
    symbol: 'DIA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd072dEcEb5FD919bF8853CeB1068438652a06c00/logo.png',
  },
  mDAI: {
    chainId: 43114,
    address: '0x6CB5008Ca0CC13862CB47906F541672e8f51A6EF',
    decimals: 18,
    name: 'DMM - DAI',
    symbol: 'mDAI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6CB5008Ca0CC13862CB47906F541672e8f51A6EF/logo.png',
  },
  mETH: {
    chainId: 43114,
    address: '0x6FEC3a5e49748088C2b9b1Ef9A6a762ABdD07805',
    decimals: 18,
    name: 'DMM - ETH',
    symbol: 'mETH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6FEC3a5e49748088C2b9b1Ef9A6a762ABdD07805/logo.png',
  },
  DMG: {
    chainId: 43114,
    address: '0xe9925Cd8639c21DFcEA667D40dD2c8f54f420618',
    decimals: 18,
    name: 'DMM - Governance',
    symbol: 'DMG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xe9925Cd8639c21DFcEA667D40dD2c8f54f420618/logo.png',
  },
  DMST: {
    chainId: 43114,
    address: '0xF64DBa678d653D5Bb743b1E764De0A11fAb0f0a3',
    decimals: 18,
    name: 'DMScript',
    symbol: 'DMST',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF64DBa678d653D5Bb743b1E764De0A11fAb0f0a3/logo.png',
  },
  DODO: {
    chainId: 43114,
    address: '0x480d6193B2a2Db2702F3ce6FE5Bc1F0c8a95336B',
    decimals: 18,
    name: 'DODO bird',
    symbol: 'DODO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x480d6193B2a2Db2702F3ce6FE5Bc1F0c8a95336B/logo.png',
  },
  DONUT: {
    chainId: 43114,
    address: '0xb2Ef3c8A2b27C219FC3396F0e9320df0E29Ec037',
    decimals: 18,
    name: 'Donut',
    symbol: 'DONUT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb2Ef3c8A2b27C219FC3396F0e9320df0E29Ec037/logo.png',
  },
  DOS: {
    chainId: 43114,
    address: '0x2C05b134888419b497fE5489D2762031a2de8031',
    decimals: 18,
    name: 'DOS Network Token',
    symbol: 'DOS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2C05b134888419b497fE5489D2762031a2de8031/logo.png',
  },
  DDIM: {
    chainId: 43114,
    address: '0xF40920212A74387387328Db8e30726C0cc62ae33',
    decimals: 18,
    name: 'DuckDaoDime',
    symbol: 'DDIM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF40920212A74387387328Db8e30726C0cc62ae33/logo.png',
  },
  DSD: {
    chainId: 43114,
    address: '0xcE4Af1de4A61C02E590cA8AD2a1493FF2A3D5fB5',
    decimals: 18,
    name: 'Dynamic Set Dollar',
    symbol: 'DSD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xcE4Af1de4A61C02E590cA8AD2a1493FF2A3D5fB5/logo.png',
  },
  eXRD: {
    chainId: 43114,
    address: '0x535E15B13f2A82350E8C02d62BDbA385a6307c30',
    decimals: 18,
    name: 'E-RADIX',
    symbol: 'eXRD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x535E15B13f2A82350E8C02d62BDbA385a6307c30/logo.png',
  },
  WOZX: {
    chainId: 43114,
    address: '0x1830DD37A0ddd3207fFAc9013E4F4D60FEC22036',
    decimals: 18,
    name: 'EFFORCE IEO',
    symbol: 'WOZX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1830DD37A0ddd3207fFAc9013E4F4D60FEC22036/logo.png',
  },
  ELF: {
    chainId: 43114,
    address: '0xfCDf63735c1Cf3203CE64fEf59DcA6A7aC9A6D54',
    decimals: 18,
    name: 'ELF Token',
    symbol: 'ELF',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xfCDf63735c1Cf3203CE64fEf59DcA6A7aC9A6D54/logo.png',
  },
  ESD: {
    chainId: 43114,
    address: '0x455b3FD5eF7bcA83C0c1Cd71695Ec7aEda773E4f',
    decimals: 18,
    name: 'Empty Set Dollar',
    symbol: 'ESD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x455b3FD5eF7bcA83C0c1Cd71695Ec7aEda773E4f/logo.png',
  },
  EWTB: {
    chainId: 43114,
    address: '0x3447d187934d323bDd1BCc6EDC643D3C8d05D86c',
    decimals: 18,
    name: 'Energy Web Token Bridged',
    symbol: 'EWTB',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3447d187934d323bDd1BCc6EDC643D3C8d05D86c/logo.png',
  },
  ENJ: {
    chainId: 43114,
    address: '0xCde255522146ddF36d57BA5Cd8D74695bD13C994',
    decimals: 18,
    name: 'Enjin Coin',
    symbol: 'ENJ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xCde255522146ddF36d57BA5Cd8D74695bD13C994/logo.png',
  },
  EQMT: {
    chainId: 43114,
    address: '0x964A11836e6Ac44E07F8632a9FF6C380Ef0113fd',
    decimals: 18,
    name: 'EQUUSMiningToken',
    symbol: 'EQMT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x964A11836e6Ac44E07F8632a9FF6C380Ef0113fd/logo.png',
  },
  ETHRSIAPY: {
    chainId: 43114,
    address: '0xD7b63a3Cf593E72c385A72e28029Bcae6db766D5',
    decimals: 18,
    name: 'ETH RSI 60/40 Yield II',
    symbol: 'ETHRSIAPY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD7b63a3Cf593E72c385A72e28029Bcae6db766D5/logo.png',
  },
  LEND: {
    chainId: 43114,
    address: '0xaeF85E9F467b2Dc187351b37BF63124C0A9bB913',
    decimals: 18,
    name: 'EthLend Token',
    symbol: 'LEND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xaeF85E9F467b2Dc187351b37BF63124C0A9bB913/logo.png',
  },
  ETHV: {
    chainId: 43114,
    address: '0xb98B8Ea9E894Caa5155Da32646152303839890a3',
    decimals: 18,
    name: 'Ethverse Token',
    symbol: 'ETHV',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb98B8Ea9E894Caa5155Da32646152303839890a3/logo.png',
  },
  EVO: {
    chainId: 43114,
    address: '0xC636AD16dd87C2D412d2c62276813dFC35558A81',
    decimals: 18,
    name: 'Evolution',
    symbol: 'EVO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC636AD16dd87C2D412d2c62276813dFC35558A81/logo.png',
  },
  XED: {
    chainId: 43114,
    address: '0x0DCE209Cd97C8bd136E433703645Dc431eF93075',
    decimals: 18,
    name: 'Exeedme',
    symbol: 'XED',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0DCE209Cd97C8bd136E433703645Dc431eF93075/logo.png',
  },
  FSW: {
    chainId: 43114,
    address: '0x479914df5B637aa9d439246116d49245Db678f97',
    decimals: 18,
    name: 'FalconSwap Token',
    symbol: 'FSW',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x479914df5B637aa9d439246116d49245Db678f97/logo.png',
  },
  FARM: {
    chainId: 43114,
    address: '0x5E92Fb74d337cd3914E0E48a7E679f87f2585471',
    decimals: 18,
    name: 'FARM Reward Token',
    symbol: 'FARM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5E92Fb74d337cd3914E0E48a7E679f87f2585471/logo.png',
  },
  FERA: {
    chainId: 43114,
    address: '0x5dc1E85C8Db7F79bbd63e6Ae35AbEb50AD55756D',
    decimals: 18,
    name: 'FERA',
    symbol: 'FERA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5dc1E85C8Db7F79bbd63e6Ae35AbEb50AD55756D/logo.png',
  },
  FET: {
    chainId: 43114,
    address: '0x23D7e6Af758883F4976617DAB2641af94FF7CA1F',
    decimals: 18,
    name: 'Fetch',
    symbol: 'FET',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x23D7e6Af758883F4976617DAB2641af94FF7CA1F/logo.png',
  },
  FNX: {
    chainId: 43114,
    address: '0x85B87e0A36865dbdeF50bdFAFB49B272077E0026',
    decimals: 18,
    name: 'FinNexus',
    symbol: 'FNX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x85B87e0A36865dbdeF50bdFAFB49B272077E0026/logo.png',
  },
  FTX: {
    chainId: 43114,
    address: '0xaD4c2Ba8C983E6A06685b6F90D0c517cD3C4301e',
    decimals: 18,
    name: 'FintruX Network',
    symbol: 'FTX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xaD4c2Ba8C983E6A06685b6F90D0c517cD3C4301e/logo.png',
  },
  FXC: {
    chainId: 43114,
    address: '0xE9C418927B36F2668dC4fe02028Aa08535a8E347',
    decimals: 18,
    name: 'Flexacoin',
    symbol: 'FXC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE9C418927B36F2668dC4fe02028Aa08535a8E347/logo.png',
  },
  FLIXX: {
    chainId: 43114,
    address: '0x5d1CE423031a2661F960740f15a93073e6ccAb13',
    decimals: 18,
    name: 'Flixx',
    symbol: 'FLIXX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5d1CE423031a2661F960740f15a93073e6ccAb13/logo.png',
  },
  FOAM: {
    chainId: 43114,
    address: '0x23F3C4fF7ef5C752593966BDe70de2Db81398Aa6',
    decimals: 18,
    name: 'FOAM Token',
    symbol: 'FOAM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x23F3C4fF7ef5C752593966BDe70de2Db81398Aa6/logo.png',
  },
  FOX: {
    chainId: 43114,
    address: '0x7e7034845b581B959Ad90a6D7424382DDd70C196',
    decimals: 18,
    name: 'FOX',
    symbol: 'FOX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7e7034845b581B959Ad90a6D7424382DDd70C196/logo.png',
  },
  FRAX: {
    chainId: 43114,
    address: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
    decimals: 18,
    name: 'Frax',
    symbol: 'FRAX',
    website: 'https://frax.finance/',
    description: 'Frax is the first fractional-algorithmic stablecoin protocol.',
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64/logo.png',
  },
  FXS: {
    chainId: 43114,
    address: '0xb1BA5Cf8EAa4D3c3439e91c190553E9c92e98E30',
    decimals: 18,
    name: 'Frax Share',
    symbol: 'FXS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb1BA5Cf8EAa4D3c3439e91c190553E9c92e98E30/logo.png',
  },
  IME: {
    chainId: 43114,
    address: '0xF891214fdcF9cDaa5fdC42369eE4F27F226AdaD6',
    decimals: 18,
    name: ' Imperium Empires Token',
    symbol: 'IME',
    logoURI:
      'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/0xF891214fdcF9cDaa5fdC42369eE4F27F226AdaD6/logo.png',
  },
  FRONT: {
    chainId: 43114,
    address: '0x3441061CbfDF2351E010DF5D962f1cF0626CF19F',
    decimals: 18,
    name: 'Frontier Token',
    symbol: 'FRONT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3441061CbfDF2351E010DF5D962f1cF0626CF19F/logo.png',
  },
  iDAI: {
    chainId: 43114,
    address: '0x8A8DD8dd5639174F032877b2D6c7467D8B51D561',
    decimals: 18,
    name: 'Fulcrum DAI iToken',
    symbol: 'iDAI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8A8DD8dd5639174F032877b2D6c7467D8B51D561/logo.png',
  },
  iETH: {
    chainId: 43114,
    address: '0x2Ae2CD4e23c09a2B68a24D56D5cf3c4e887Da849',
    decimals: 18,
    name: 'Fulcrum ETH iToken',
    symbol: 'iETH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2Ae2CD4e23c09a2B68a24D56D5cf3c4e887Da849/logo.png',
  },
  COMBO: {
    chainId: 43114,
    address: '0xF8fc972343698Ac3C466858ce6CF48bBc83a0852',
    decimals: 18,
    name: 'Furucombo',
    symbol: 'COMBO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF8fc972343698Ac3C466858ce6CF48bBc83a0852/logo.png',
  },
  FUSE: {
    chainId: 43114,
    address: '0xd3974AE5A9BCD4AE4c9037a25A67374a11df4154',
    decimals: 18,
    name: 'Fuse Token',
    symbol: 'FUSE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd3974AE5A9BCD4AE4c9037a25A67374a11df4154/logo.png',
  },
  GEEQ: {
    chainId: 43114,
    address: '0x3326235Ec1AFf2799dE463413114b800d251089d',
    decimals: 18,
    name: 'Geeq',
    symbol: 'GEEQ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3326235Ec1AFf2799dE463413114b800d251089d/logo.png',
  },
  GVT: {
    chainId: 43114,
    address: '0x9D3b7a5e30654Ab86039c929880b078B34c41625',
    decimals: 18,
    name: 'Genesis Vision Token',
    symbol: 'GVT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9D3b7a5e30654Ab86039c929880b078B34c41625/logo.png',
  },
  GYSR: {
    chainId: 43114,
    address: '0x6419e589dB783c5396d94f3237879a010fdB5C44',
    decimals: 18,
    name: 'Geyser',
    symbol: 'GYSR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6419e589dB783c5396d94f3237879a010fdB5C44/logo.png',
  },
  GHOST: {
    chainId: 43114,
    address: '0x4F229fF652D4dB584BF4b3512aE430edECb85971',
    decimals: 18,
    name: 'GHOST',
    symbol: 'GHOST',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4F229fF652D4dB584BF4b3512aE430edECb85971/logo.png',
  },
  GNO: {
    chainId: 43114,
    address: '0xBAA66822055AD37EC05638eC5AAfDC6Ef0e96445',
    decimals: 18,
    name: 'Gnosis Token',
    symbol: 'GNO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBAA66822055AD37EC05638eC5AAfDC6Ef0e96445/logo.png',
  },
  MNTP: {
    chainId: 43114,
    address: '0x56f45Ca7C6e8d5550b36f4C69a0dEA44defEe3Ef',
    decimals: 18,
    name: 'Goldmint MNT Prelaunch Token',
    symbol: 'MNTP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x56f45Ca7C6e8d5550b36f4C69a0dEA44defEe3Ef/logo.png',
  },
  GOF: {
    chainId: 43114,
    address: '0x44D24Df9732DA8b230c819b0bf22b6C6377B42c4',
    decimals: 18,
    name: 'Golff.finance',
    symbol: 'GOF',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x44D24Df9732DA8b230c819b0bf22b6C6377B42c4/logo.png',
  },
  GRT: {
    chainId: 43114,
    address: '0x46C54b16aF7747067f412c78eBaDaE203a26aDa0',
    decimals: 18,
    name: 'Graph Token',
    symbol: 'GRT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x46C54b16aF7747067f412c78eBaDaE203a26aDa0/logo.png',
  },
  GRO: {
    chainId: 43114,
    address: '0xBAd7b06c436200dB693Dd49418A96E2bF857f9a2',
    decimals: 18,
    name: 'Growth',
    symbol: 'GRO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBAd7b06c436200dB693Dd49418A96E2bF857f9a2/logo.png',
  },
  HAKKA: {
    chainId: 43114,
    address: '0xf21074038dc2ea2A280EC890be55Ae3Be84616e3',
    decimals: 18,
    name: 'Hakka Finance',
    symbol: 'HAKKA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf21074038dc2ea2A280EC890be55Ae3Be84616e3/logo.png',
  },
  HEGIC: {
    chainId: 43114,
    address: '0x20642e9cdd6BFe701817A7b50dE89777C8F2b208',
    decimals: 18,
    name: 'Hegic',
    symbol: 'HEGIC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x20642e9cdd6BFe701817A7b50dE89777C8F2b208/logo.png',
  },
  HEZ: {
    chainId: 43114,
    address: '0x79c340eAFaC9Cc81d9BF128aa1785E669e06FBe2',
    decimals: 18,
    name: 'Hermez Network Token',
    symbol: 'HEZ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x79c340eAFaC9Cc81d9BF128aa1785E669e06FBe2/logo.png',
  },
  HOT: {
    chainId: 43114,
    address: '0xA471033610995EEdF0D6E4C598a4A9b4EC99c700',
    decimals: 18,
    name: 'HoloToken',
    symbol: 'HOT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA471033610995EEdF0D6E4C598a4A9b4EC99c700/logo.png',
  },
  HOLY: {
    chainId: 43114,
    address: '0x2167d6A882e9beB324D08e6663d4D419ac578792',
    decimals: 18,
    name: 'Holyheld',
    symbol: 'HOLY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2167d6A882e9beB324D08e6663d4D419ac578792/logo.png',
  },
  HBTC: {
    chainId: 43114,
    address: '0x8c1632b83D9E2D3C31B0728e953A22B7B33348A3',
    decimals: 18,
    name: 'Huobi BTC',
    symbol: 'HBTC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8c1632b83D9E2D3C31B0728e953A22B7B33348A3/logo.png',
  },
  HT: {
    chainId: 43114,
    address: '0x421b2a69b886BA17a61C7dAd140B9070d5Ef300B',
    decimals: 18,
    name: 'HuobiToken',
    symbol: 'HT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x421b2a69b886BA17a61C7dAd140B9070d5Ef300B/logo.png',
  },
  IDEX: {
    chainId: 43114,
    address: '0x59535b9BA6029edb7588dF41Ed388584FBEA706C',
    decimals: 18,
    name: 'IDEX Token',
    symbol: 'IDEX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x59535b9BA6029edb7588dF41Ed388584FBEA706C/logo.png',
  },
  INDEX: {
    chainId: 43114,
    address: '0x3d26cefE5fAE96FFd48801e1E61975b3CB75036B',
    decimals: 18,
    name: 'Index',
    symbol: 'INDEX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3d26cefE5fAE96FFd48801e1E61975b3CB75036B/logo.png',
  },
  NDX: {
    chainId: 43114,
    address: '0x7633b4710042F9Dd22e3FC63E59E4BFDcb6813B9',
    decimals: 18,
    name: 'Indexed',
    symbol: 'NDX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7633b4710042F9Dd22e3FC63E59E4BFDcb6813B9/logo.png',
  },
  IND: {
    chainId: 43114,
    address: '0xB9d0574a8049e5fd4331ACDc1CF3ce2FF3261bE9',
    decimals: 18,
    name: 'Indorse Token',
    symbol: 'IND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB9d0574a8049e5fd4331ACDc1CF3ce2FF3261bE9/logo.png',
  },
  INFI: {
    chainId: 43114,
    address: '0x1d590AD61A7b56071A5858301aCe7DD3D31f0Dd0',
    decimals: 18,
    name: 'INFI',
    symbol: 'INFI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1d590AD61A7b56071A5858301aCe7DD3D31f0Dd0/logo.png',
  },
  INJ: {
    chainId: 43114,
    address: '0xfE057C0496eF3CCa8d85d847dA99c9815ba9981F',
    decimals: 18,
    name: 'Injective Token',
    symbol: 'INJ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xfE057C0496eF3CCa8d85d847dA99c9815ba9981F/logo.png',
  },
  XNK: {
    chainId: 43114,
    address: '0x703a3cC60E5E7ed2b28Bdc50D66C260b4aAB03dC',
    decimals: 18,
    name: 'Ink Protocol',
    symbol: 'XNK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x703a3cC60E5E7ed2b28Bdc50D66C260b4aAB03dC/logo.png',
  },
  JUL: {
    chainId: 43114,
    address: '0xC839E0D590BBb1b64A46A3F6aB6Feb596ced7439',
    decimals: 18,
    name: 'JUL',
    symbol: 'JUL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC839E0D590BBb1b64A46A3F6aB6Feb596ced7439/logo.png',
  },
  KAI: {
    chainId: 43114,
    address: '0x1D81360dADf2E1756FaeAe46072dD12997170F46',
    decimals: 18,
    name: 'KardiaChain Token',
    symbol: 'KAI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1D81360dADf2E1756FaeAe46072dD12997170F46/logo.png',
  },
  KEEP: {
    chainId: 43114,
    address: '0x73945347fbCBFed872D590110f817621440a9d39',
    decimals: 18,
    name: 'KEEP Token',
    symbol: 'KEEP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x73945347fbCBFed872D590110f817621440a9d39/logo.png',
  },
  KP3R: {
    chainId: 43114,
    address: '0xB42F2c83b4ee3C3620789B5603f4bdf01792e0a0',
    decimals: 18,
    name: 'Keep3rV1',
    symbol: 'KP3R',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB42F2c83b4ee3C3620789B5603f4bdf01792e0a0/logo.png',
  },
  KP4R: {
    chainId: 43114,
    address: '0xEeB395dEc67742cCF7E6Aea920DC2b7FCF01e725',
    decimals: 18,
    name: 'Keep4r',
    symbol: 'KP4R',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xEeB395dEc67742cCF7E6Aea920DC2b7FCF01e725/logo.png',
  },
  KEN: {
    chainId: 43114,
    address: '0x833A32E28Bbb289C0ba13c69A08dB9E9526D4907',
    decimals: 18,
    name: 'Kenysians Network',
    symbol: 'KEN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x833A32E28Bbb289C0ba13c69A08dB9E9526D4907/logo.png',
  },
  kSEED: {
    chainId: 43114,
    address: '0x47e4c63922766e1b386fa7296c994aC474062Bd4',
    decimals: 18,
    name: 'KUSH.FINANCE',
    symbol: 'kSEED',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x47e4c63922766e1b386fa7296c994aC474062Bd4/logo.png',
  },
  KNC: {
    chainId: 43114,
    address: '0xb7f7C9347f55d6d6265e152c636cD29aB17Dc9F6',
    decimals: 18,
    name: 'Kyber Network Crystal',
    symbol: 'KNC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb7f7C9347f55d6d6265e152c636cD29aB17Dc9F6/logo.png',
  },
  TAU: {
    chainId: 43114,
    address: '0x4D49159F233506087426094CDa371B5817f30331',
    decimals: 18,
    name: 'Lamden Tau',
    symbol: 'TAU',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4D49159F233506087426094CDa371B5817f30331/logo.png',
  },
  LDC: {
    chainId: 43114,
    address: '0x78c703129FA14c96164c6e14497edAB6CF215A93',
    decimals: 18,
    name: 'LEADCOIN',
    symbol: 'LDC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x78c703129FA14c96164c6e14497edAB6CF215A93/logo.png',
  },
  LST: {
    chainId: 43114,
    address: '0x4E0226a638adCBB43C99131c743B9Aba15Ff3040',
    decimals: 18,
    name: 'Lendroid Support Token',
    symbol: 'LST',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4E0226a638adCBB43C99131c743B9Aba15Ff3040/logo.png',
  },
  LGCY: {
    chainId: 43114,
    address: '0x548A24D7eB18ea8A771645651EE799807d41F2dF',
    decimals: 18,
    name: 'LGCY Network',
    symbol: 'LGCY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x548A24D7eB18ea8A771645651EE799807d41F2dF/logo.png',
  },
  LAR: {
    chainId: 43114,
    address: '0xc162e489C7f39676F6376CA79df3e728f101a895',
    decimals: 18,
    name: 'Linkart',
    symbol: 'LAR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xc162e489C7f39676F6376CA79df3e728f101a895/logo.png',
  },
  LID: {
    chainId: 43114,
    address: '0xB9b00fbac0F8B7c25a360664CE0Bf819771B4144',
    decimals: 18,
    name: 'Liquidity Dividends Protocol',
    symbol: 'LID',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB9b00fbac0F8B7c25a360664CE0Bf819771B4144/logo.png',
  },
  LPT: {
    chainId: 43114,
    address: '0x2c67EC45B2E7138823dee0576D0d17Ac6Aa36b74',
    decimals: 18,
    name: 'Livepeer Token',
    symbol: 'LPT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2c67EC45B2E7138823dee0576D0d17Ac6Aa36b74/logo.png',
  },
  LOC: {
    chainId: 43114,
    address: '0xb7617ad97645729f41cfd969312532e080f03864',
    decimals: 18,
    name: 'LockChain',
    symbol: 'LOC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb7617ad97645729f41cfd969312532e080f03864/logo.png',
  },
  LOOM: {
    chainId: 43114,
    address: '0xfA178938Da2d58e55e52dc6dB92B99d9B2102EaE',
    decimals: 18,
    name: 'LoomToken',
    symbol: 'LOOM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xfA178938Da2d58e55e52dc6dB92B99d9B2102EaE/logo.png',
  },
  LRC: {
    chainId: 43114,
    address: '0x628A9639cc78F46604A625452C0242c7B487BA3c',
    decimals: 18,
    name: 'LoopringCoin V2',
    symbol: 'LRC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x628A9639cc78F46604A625452C0242c7B487BA3c/logo.png',
  },
  LUA: {
    chainId: 43114,
    address: '0xeCd99fe115553493C6BF41C27da69E131766baAd',
    decimals: 18,
    name: 'LuaToken',
    symbol: 'LUA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xeCd99fe115553493C6BF41C27da69E131766baAd/logo.png',
  },
  LYXe: {
    chainId: 43114,
    address: '0xcd82B8f5f145abb08f8c495BDB675d1Ac4D40Eb2',
    decimals: 18,
    name: 'LUKSO Token',
    symbol: 'LYXe',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xcd82B8f5f145abb08f8c495BDB675d1Ac4D40Eb2/logo.png',
  },
  LMY: {
    chainId: 43114,
    address: '0x8a86e6dC6611c34d5c92fC563f426D2E378b3f1C',
    decimals: 18,
    name: 'Lunch Money',
    symbol: 'LMY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8a86e6dC6611c34d5c92fC563f426D2E378b3f1C/logo.png',
  },
  MCX: {
    chainId: 43114,
    address: '0x8CFD9b30B18B3aF9Ce905561F749626ef06B1717',
    decimals: 18,
    name: 'MachiX Token',
    symbol: 'MCX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8CFD9b30B18B3aF9Ce905561F749626ef06B1717/logo.png',
  },
  MAHA: {
    chainId: 43114,
    address: '0xb0cb6B9C9B47a3974044AE906E8865165D2e0889',
    decimals: 18,
    name: 'MahaDAO',
    symbol: 'MAHA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb0cb6B9C9B47a3974044AE906E8865165D2e0889/logo.png',
  },
  MFT: {
    chainId: 43114,
    address: '0x254Aa21D2996400b19CeE93623C307D6E973Ea3f',
    decimals: 18,
    name: 'Mainframe Token',
    symbol: 'MFT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x254Aa21D2996400b19CeE93623C307D6E973Ea3f/logo.png',
  },
  OM: {
    chainId: 43114,
    address: '0x33d6584872635e1BA681Ad814B98b57198cf33eF',
    decimals: 18,
    name: 'MANTRA DAO',
    symbol: 'OM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x33d6584872635e1BA681Ad814B98b57198cf33eF/logo.png',
  },
  POND: {
    chainId: 43114,
    address: '0xbeeA21cC5D10e21dF6aB42Bd2D5e748e4EF59293',
    decimals: 18,
    name: 'Marlin POND',
    symbol: 'POND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbeeA21cC5D10e21dF6aB42Bd2D5e748e4EF59293/logo.png',
  },
  MATH: {
    chainId: 43114,
    address: '0x374C62a3B07350de41C4A95c4094474f84d7BF66',
    decimals: 18,
    name: 'MATH Token',
    symbol: 'MATH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x374C62a3B07350de41C4A95c4094474f84d7BF66/logo.png',
  },
  MATIC: {
    chainId: 43114,
    address: '0x885ca6663E1E19DAD31c1e08D9958a2b8F538D53',
    decimals: 18,
    name: 'Matic Token',
    symbol: 'MATIC',
    website: 'https://polygon.technology/',
    description:
      'The MATIC token serves dual purposes: securing the Polygon network via staking and being used for the payment of transaction fees.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x885ca6663E1E19DAD31c1e08D9958a2b8F538D53/logo.png',
  },
  MCB: {
    chainId: 43114,
    address: '0xD4355F4608277a616111B35A77E6C58F4B4B69c6',
    decimals: 18,
    name: 'MCDEX Token',
    symbol: 'MCB',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD4355F4608277a616111B35A77E6C58F4B4B69c6/logo.png',
  },
  MDT: {
    chainId: 43114,
    address: '0x66a41BAD9103435c57E1dABE10093Dc5a19ee99f',
    decimals: 18,
    name: 'Measurable Data Token',
    symbol: 'MDT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x66a41BAD9103435c57E1dABE10093Dc5a19ee99f/logo.png',
  },
  MEGA: {
    chainId: 43114,
    address: '0x0C452CCc765Ac4A5d90E40585487c482597dFDdE',
    decimals: 18,
    name: 'MegaCryptoPolis MEGA Token',
    symbol: 'MEGA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0C452CCc765Ac4A5d90E40585487c482597dFDdE/logo.png',
  },
  MLN: {
    chainId: 43114,
    address: '0x2bD2e0C3d39d6c82EaCA300958aa2E4be6740223',
    decimals: 18,
    name: 'Melon Token',
    symbol: 'MLN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2bD2e0C3d39d6c82EaCA300958aa2E4be6740223/logo.png',
  },
  LOCK: {
    chainId: 43114,
    address: '0xDC59a3AC96dc1e86bB93Ed0248fB4bA6127BA64c',
    decimals: 18,
    name: 'Meridian Network',
    symbol: 'LOCK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xDC59a3AC96dc1e86bB93Ed0248fB4bA6127BA64c/logo.png',
  },
  MTA: {
    chainId: 43114,
    address: '0x61EDA5B986b9da6A67a2a128e67ee7CED890DEAb',
    decimals: 18,
    name: 'Meta',
    symbol: 'MTA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x61EDA5B986b9da6A67a2a128e67ee7CED890DEAb/logo.png',
  },
  eMTRG: {
    chainId: 43114,
    address: '0x99B1b197D53511929A082EE66e7aC7E23257a4c4',
    decimals: 18,
    name: 'Meter Governance mapped by Meter.io',
    symbol: 'eMTRG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x99B1b197D53511929A082EE66e7aC7E23257a4c4/logo.png',
  },
  MET: {
    chainId: 43114,
    address: '0x74F691fe2F89055cb1E641b840C8e7f12552dd6A',
    decimals: 18,
    name: 'Metronome',
    symbol: 'MET',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x74F691fe2F89055cb1E641b840C8e7f12552dd6A/logo.png',
  },
  MIC: {
    chainId: 43114,
    address: '0x3C4dd53806347D37aF1F9CCA08C5aCA7363abADe',
    decimals: 18,
    name: 'MIC',
    symbol: 'MIC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3C4dd53806347D37aF1F9CCA08C5aCA7363abADe/logo.png',
  },
  MILK2: {
    chainId: 43114,
    address: '0x1A4a456DcB9415D6FBac1148A656BD93a78c43e1',
    decimals: 18,
    name: 'MilkyWay Token by SpaceSwap v2',
    symbol: 'MILK2',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1A4a456DcB9415D6FBac1148A656BD93a78c43e1/logo.png',
  },
  MINI: {
    chainId: 43114,
    address: '0xF553b0fA370E11d945D1eDA4267437C9e4C51D8a',
    decimals: 18,
    name: 'MINISWAP',
    symbol: 'MINI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF553b0fA370E11d945D1eDA4267437C9e4C51D8a/logo.png',
  },
  MIS: {
    chainId: 43114,
    address: '0x7823dAa7A5B86dd4E7a54c1ae70A14cf15758316',
    decimals: 18,
    name: 'MIS',
    symbol: 'MIS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7823dAa7A5B86dd4E7a54c1ae70A14cf15758316/logo.png',
  },
  MXT: {
    chainId: 43114,
    address: '0x77d208c2b37051957C2B7D88a3682C280d70e7e6',
    decimals: 18,
    name: 'MixTrust',
    symbol: 'MXT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x77d208c2b37051957C2B7D88a3682C280d70e7e6/logo.png',
  },
  mUSD: {
    chainId: 43114,
    address: '0x4D06D5296c0BE7857a9C43B5EB1770909d40CB25',
    decimals: 18,
    name: 'mStable USD',
    symbol: 'mUSD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4D06D5296c0BE7857a9C43B5EB1770909d40CB25/logo.png',
  },
  MYB: {
    chainId: 43114,
    address: '0x3D7af5Cc0143402A65d0dDC7E4C559fed65AE78c',
    decimals: 18,
    name: 'MyBit',
    symbol: 'MYB',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3D7af5Cc0143402A65d0dDC7E4C559fed65AE78c/logo.png',
  },
  NEXO: {
    chainId: 43114,
    address: '0xfe87Aba89d58da09d5bC13b4A1dC873C1b901806',
    decimals: 18,
    name: 'Nexo',
    symbol: 'NEXO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xfe87Aba89d58da09d5bC13b4A1dC873C1b901806/logo.png',
  },
  NBT: {
    chainId: 43114,
    address: '0x3E6867bB936e83BC686A89fdBfab3FD0D6ee3DE8',
    decimals: 18,
    name: 'NIX Bridge Token',
    symbol: 'NBT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3E6867bB936e83BC686A89fdBfab3FD0D6ee3DE8/logo.png',
  },
  Nsure: {
    chainId: 43114,
    address: '0x6169F17c609D14F253d0d54a96df6eFD2A44147a',
    decimals: 18,
    name: 'Nsure Network Token',
    symbol: 'Nsure',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6169F17c609D14F253d0d54a96df6eFD2A44147a/logo.png',
  },
  NU: {
    chainId: 43114,
    address: '0x32141622A7C79790176670ffFcA17154678A9A24',
    decimals: 18,
    name: 'NuCypher',
    symbol: 'NU',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x32141622A7C79790176670ffFcA17154678A9A24/logo.png',
  },
  NMR: {
    chainId: 43114,
    address: '0x57541c10591Df7568BDc9D93f769d44eAc1e3c3a',
    decimals: 18,
    name: 'Numeraire',
    symbol: 'NMR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x57541c10591Df7568BDc9D93f769d44eAc1e3c3a/logo.png',
  },
  OCEAN: {
    chainId: 43114,
    address: '0x0057371Cd534577b6040E140654DE0958116Cf3A',
    decimals: 18,
    name: 'Ocean Token',
    symbol: 'OCEAN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0057371Cd534577b6040E140654DE0958116Cf3A/logo.png',
  },
  OCTO: {
    chainId: 43114,
    address: '0xC0735F8b43B6879FED7070044211bFcd9C3d633B',
    decimals: 18,
    name: 'Octo.fi',
    symbol: 'OCTO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC0735F8b43B6879FED7070044211bFcd9C3d633B/logo.png',
  },
  'OM-OM Token': {
    chainId: 43114,
    address: '0x27850FcbCfF7DAFB16176144B9193C6D310DCF72',
    decimals: 18,
    name: 'OM Token',
    symbol: 'OM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x27850FcbCfF7DAFB16176144B9193C6D310DCF72/logo.png',
  },
  OMG: {
    chainId: 43114,
    address: '0x276C6670b97F22cE7Ad754b08CB330DECb6a3332',
    decimals: 18,
    name: 'OMGToken',
    symbol: 'OMG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x276C6670b97F22cE7Ad754b08CB330DECb6a3332/logo.png',
  },
  ONG: {
    chainId: 43114,
    address: '0xbAeE145A92A0c7C2FEd63d62d61E9B7eAe0396d9',
    decimals: 18,
    name: 'onG',
    symbol: 'ONG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbAeE145A92A0c7C2FEd63d62d61E9B7eAe0396d9/logo.png',
  },
  OPT: {
    chainId: 43114,
    address: '0x2378B1EEb109bd40FF585AB9A92aC3Fd9E90cee3',
    decimals: 18,
    name: 'Open Predict Token',
    symbol: 'OPT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2378B1EEb109bd40FF585AB9A92aC3Fd9E90cee3/logo.png',
  },
  ORAI: {
    chainId: 43114,
    address: '0xD9A0B28305951758b9CdBbf7e18CC85B868f973C',
    decimals: 18,
    name: 'Oraichain Token',
    symbol: 'ORAI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD9A0B28305951758b9CdBbf7e18CC85B868f973C/logo.png',
  },
  OGN: {
    chainId: 43114,
    address: '0x9A1712dBEd062dB70c6c4C235Be9dCd10a9Dac59',
    decimals: 18,
    name: 'OriginToken',
    symbol: 'OGN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9A1712dBEd062dB70c6c4C235Be9dCd10a9Dac59/logo.png',
  },
  ORO: {
    chainId: 43114,
    address: '0x2796213bd26CE2270839b6d40E8D5904d8cDAA42',
    decimals: 18,
    name: 'ORO Token',
    symbol: 'ORO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2796213bd26CE2270839b6d40E8D5904d8cDAA42/logo.png',
  },
  OWL: {
    chainId: 43114,
    address: '0xe49403892253A3d7952A45d43C630126D0b8D1f2',
    decimals: 18,
    name: 'OWL Token',
    symbol: 'OWL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xe49403892253A3d7952A45d43C630126D0b8D1f2/logo.png',
  },
  PAMP: {
    chainId: 43114,
    address: '0x5b1cdDC4e6C9E6864832954d0cF43f91952CD7B9',
    decimals: 18,
    name: 'Pamp Network',
    symbol: 'PAMP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5b1cdDC4e6C9E6864832954d0cF43f91952CD7B9/logo.png',
  },
  PAN: {
    chainId: 43114,
    address: '0xF6Ef95FaD0CdddfCCC312679779516107a980E0a',
    decimals: 18,
    name: 'Panvala pan',
    symbol: 'PAN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF6Ef95FaD0CdddfCCC312679779516107a980E0a/logo.png',
  },
  PAR: {
    chainId: 43114,
    address: '0x53b464Bb9EfEBe9b314f97e631b47e1C0300FE21',
    decimals: 18,
    name: 'Parachute',
    symbol: 'PAR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x53b464Bb9EfEBe9b314f97e631b47e1C0300FE21/logo.png',
  },
  PARETO: {
    chainId: 43114,
    address: '0x54266edA68834321B5BB81a8A8a48d5459c92456',
    decimals: 18,
    name: 'Pareto Network Token',
    symbol: 'PARETO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x54266edA68834321B5BB81a8A8a48d5459c92456/logo.png',
  },
  PRQ: {
    chainId: 43114,
    address: '0x6A8E6794ab77C63c3C90A62F1088F16AC61F463D',
    decimals: 18,
    name: 'Parsiq Token',
    symbol: 'PRQ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6A8E6794ab77C63c3C90A62F1088F16AC61F463D/logo.png',
  },
  PAXG: {
    chainId: 43114,
    address: '0x1687b16087B576E403C8d6926fBc0798e48FD0de',
    decimals: 18,
    name: 'Paxos Gold',
    symbol: 'PAXG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1687b16087B576E403C8d6926fBc0798e48FD0de/logo.png',
  },
  PAX: {
    chainId: 43114,
    address: '0x403985fD6628E44b6fca9876575b9503cB80A47A',
    decimals: 18,
    name: 'Paxos Standard',
    symbol: 'PAX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x403985fD6628E44b6fca9876575b9503cB80A47A/logo.png',
  },
  PERX: {
    chainId: 43114,
    address: '0x02f8a8e78E02768A5c2f9Cf1Bfa8Ec2f821E869d',
    decimals: 18,
    name: 'PeerEx Network',
    symbol: 'PERX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x02f8a8e78E02768A5c2f9Cf1Bfa8Ec2f821E869d/logo.png',
  },
  PERL: {
    chainId: 43114,
    address: '0x8f4Dee85B841723bdCEcdc9Ed68Cda662f56e82A',
    decimals: 18,
    name: 'Perlin',
    symbol: 'PERL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8f4Dee85B841723bdCEcdc9Ed68Cda662f56e82A/logo.png',
  },
  PERP: {
    chainId: 43114,
    address: '0x88Af8D172e64326A71C1a7756CB4F6125D98F2A5',
    decimals: 18,
    name: 'Perpetual',
    symbol: 'PERP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x88Af8D172e64326A71C1a7756CB4F6125D98F2A5/logo.png',
  },
  PHA: {
    chainId: 43114,
    address: '0x5535483ed8781784b1b1cC431c4dc9c25D39eCB5',
    decimals: 18,
    name: 'Phala',
    symbol: 'PHA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5535483ed8781784b1b1cC431c4dc9c25D39eCB5/logo.png',
  },
  PICKLE: {
    chainId: 43114,
    address: '0xD9eD8258c3ECBB5E4ECf3b91dc0ca693e80934CC',
    decimals: 18,
    name: 'PickleToken',
    symbol: 'PICKLE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD9eD8258c3ECBB5E4ECf3b91dc0ca693e80934CC/logo.png',
  },
  PLR: {
    chainId: 43114,
    address: '0xD523c90aCb4415A48e1504BaAd3a2Aa8fd86dEF9',
    decimals: 18,
    name: 'PILLAR',
    symbol: 'PLR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD523c90aCb4415A48e1504BaAd3a2Aa8fd86dEF9/logo.png',
  },
  PPAY: {
    chainId: 43114,
    address: '0x3B295608d13083270214C0778624BCebCa5df3DA',
    decimals: 18,
    name: 'Plasma',
    symbol: 'PPAY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3B295608d13083270214C0778624BCebCa5df3DA/logo.png',
  },
  PLOT: {
    chainId: 43114,
    address: '0x5643c59d08d9ac382EeB224894608D52c7fcd908',
    decimals: 18,
    name: 'PLOT',
    symbol: 'PLOT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5643c59d08d9ac382EeB224894608D52c7fcd908/logo.png',
  },
  PLU: {
    chainId: 43114,
    address: '0x680e3f5d629ECF176150E343D9EfA1aA1062659D',
    decimals: 18,
    name: 'Pluton',
    symbol: 'PLU',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x680e3f5d629ECF176150E343D9EfA1aA1062659D/logo.png',
  },
  PLT: {
    chainId: 43114,
    address: '0xBc6e632244FD9a79e863B87841FFD9962B725895',
    decimals: 18,
    name: 'PlutusDeFi',
    symbol: 'PLT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBc6e632244FD9a79e863B87841FFD9962B725895/logo.png',
  },
  PNT: {
    chainId: 43114,
    address: '0xa4EFc8d7007851CFE5313c02aC2516f33f199364',
    decimals: 18,
    name: 'pNetwork Token',
    symbol: 'PNT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa4EFc8d7007851CFE5313c02aC2516f33f199364/logo.png',
  },
  POA20: {
    chainId: 43114,
    address: '0x153446d731f6a23661BebCD3e86431c36bA440fB',
    decimals: 18,
    name: 'POA ERC20 on Foundation',
    symbol: 'POA20',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x153446d731f6a23661BebCD3e86431c36bA440fB/logo.png',
  },
  PBR: {
    chainId: 43114,
    address: '0x3c09D70fB667e2B680d4FeE2951d6BCD3f8Fbaf9',
    decimals: 18,
    name: 'PolkaBridge',
    symbol: 'PBR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3c09D70fB667e2B680d4FeE2951d6BCD3f8Fbaf9/logo.png',
  },
  CVR: {
    chainId: 43114,
    address: '0x606E714710b0426d3E786394Ada61d5B1492C39f',
    decimals: 18,
    name: 'PolkaCover',
    symbol: 'CVR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x606E714710b0426d3E786394Ada61d5B1492C39f/logo.png',
  },
  POLS: {
    chainId: 43114,
    address: '0xE1463E8991c8A62e64b77b5Fb6B22F190344C2A9',
    decimals: 18,
    name: 'PolkastarterToken',
    symbol: 'POLS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE1463E8991c8A62e64b77b5Fb6B22F190344C2A9/logo.png',
  },
  POLY: {
    chainId: 43114,
    address: '0x1676C3D77ac75741678d6Ca28f288352a57D0973',
    decimals: 18,
    name: 'Polymath',
    symbol: 'POLY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1676C3D77ac75741678d6Ca28f288352a57D0973/logo.png',
  },
  PIPT: {
    chainId: 43114,
    address: '0x606f5C16c01372C28345de54cf6F4ff901d934B6',
    decimals: 18,
    name: 'Power Index Pool Token',
    symbol: 'PIPT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x606f5C16c01372C28345de54cf6F4ff901d934B6/logo.png',
  },
  PTF: {
    chainId: 43114,
    address: '0x01cC32A282050740a88c43DAc0B56bf90f6435eF',
    decimals: 18,
    name: 'PowerTrade Fuel Token',
    symbol: 'PTF',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x01cC32A282050740a88c43DAc0B56bf90f6435eF/logo.png',
  },
  PRDX: {
    chainId: 43114,
    address: '0x693656BE08A4C74236110ccdf4da42Ef31379E25',
    decimals: 18,
    name: 'Predix Network',
    symbol: 'PRDX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x693656BE08A4C74236110ccdf4da42Ef31379E25/logo.png',
  },
  PROPS: {
    chainId: 43114,
    address: '0x2A5A930d00110a4970bC68cF4Bcb207588cA0D2d',
    decimals: 18,
    name: 'Props Token',
    symbol: 'PROPS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2A5A930d00110a4970bC68cF4Bcb207588cA0D2d/logo.png',
  },
  pBTC: {
    chainId: 43114,
    address: '0xe6338226c321f3089c645ab526f844713C2F7Be3',
    decimals: 18,
    name: 'pTokens BTC',
    symbol: 'pBTC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xe6338226c321f3089c645ab526f844713C2F7Be3/logo.png',
  },
  NPXS: {
    chainId: 43114,
    address: '0x07d83B7101c540fcC1720c3d51923f218Ae9b6Ac',
    decimals: 18,
    name: 'Pundi X Token',
    symbol: 'NPXS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x07d83B7101c540fcC1720c3d51923f218Ae9b6Ac/logo.png',
  },
  QDAO: {
    chainId: 43114,
    address: '0xc57719864387B11B8915eDE8f84A8d2CCA282451',
    decimals: 18,
    name: 'Q DAO Governance token v1.0',
    symbol: 'QDAO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xc57719864387B11B8915eDE8f84A8d2CCA282451/logo.png',
  },
  eQUAD: {
    chainId: 43114,
    address: '0xA8990B4FA2ba67f3B14814Be106B88f251397D3F',
    decimals: 18,
    name: 'QuadrantProtocol',
    symbol: 'eQUAD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA8990B4FA2ba67f3B14814Be106B88f251397D3F/logo.png',
  },
  QNT: {
    chainId: 43114,
    address: '0x4fcC1E009ef85B35d39B3Fe533d27751e4CFa8f7',
    decimals: 18,
    name: 'Quant',
    symbol: 'QNT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4fcC1E009ef85B35d39B3Fe533d27751e4CFa8f7/logo.png',
  },
  QKC: {
    chainId: 43114,
    address: '0xa9B41c348717F755101189b907F37Ee4ec703E8C',
    decimals: 18,
    name: 'QuarkChain Token',
    symbol: 'QKC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xa9B41c348717F755101189b907F37Ee4ec703E8C/logo.png',
  },
  QRX: {
    chainId: 43114,
    address: '0xBB9a99de392Fb34d9f4F59c2b7Ea72cE7f1570e4',
    decimals: 18,
    name: 'QuiverX',
    symbol: 'QRX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBB9a99de392Fb34d9f4F59c2b7Ea72cE7f1570e4/logo.png',
  },
  RAE: {
    chainId: 43114,
    address: '0x4732Cc19937e4DaF4BDcA6698f2552b2E9F04813',
    decimals: 18,
    name: 'RAE Token',
    symbol: 'RAE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4732Cc19937e4DaF4BDcA6698f2552b2E9F04813/logo.png',
  },
  RDN: {
    chainId: 43114,
    address: '0x4A8918352cCB78CF6bd34Bf89D501d5578ee6504',
    decimals: 18,
    name: 'Raiden Token',
    symbol: 'RDN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4A8918352cCB78CF6bd34Bf89D501d5578ee6504/logo.png',
  },
  RAMP: {
    chainId: 43114,
    address: '0x182795eE69b458930633A60DA79E8F9787A4828c',
    decimals: 18,
    name: 'RAMP DEFI',
    symbol: 'RAMP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x182795eE69b458930633A60DA79E8F9787A4828c/logo.png',
  },
  RGT: {
    chainId: 43114,
    address: '0x337e4Ff263BC2E8dFb9a1a8a1AF883f0AdF953f0',
    decimals: 18,
    name: 'Rari Governance Token',
    symbol: 'RGT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x337e4Ff263BC2E8dFb9a1a8a1AF883f0AdF953f0/logo.png',
  },
  RARI: {
    chainId: 43114,
    address: '0x10D56b868A32670f27478Ac628a2376A235F9bB8',
    decimals: 18,
    name: 'Rarible',
    symbol: 'RARI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x10D56b868A32670f27478Ac628a2376A235F9bB8/logo.png',
  },
  REEF: {
    chainId: 43114,
    address: '0x90557E63339cAed393ee15Cb6236Bb746DeD11D3',
    decimals: 18,
    name: 'Reef.finance',
    symbol: 'REEF',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x90557E63339cAed393ee15Cb6236Bb746DeD11D3/logo.png',
  },
  REL: {
    chainId: 43114,
    address: '0x8FF91E20Aab3D5A21b0c5ecd45FC942c52f578b3',
    decimals: 18,
    name: 'Relevant',
    symbol: 'REL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8FF91E20Aab3D5A21b0c5ecd45FC942c52f578b3/logo.png',
  },
  REN: {
    chainId: 43114,
    address: '0xAc6C38f2DeC391b478144Ae7F078D08B08d0a284',
    decimals: 18,
    name: 'Republic Token',
    symbol: 'REN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xAc6C38f2DeC391b478144Ae7F078D08B08d0a284/logo.png',
  },
  REPv2: {
    chainId: 43114,
    address: '0xBe7AFAa2833d7F461D8751f1f46bF259fc4459C6',
    decimals: 18,
    name: 'Reputation',
    symbol: 'REPv2',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBe7AFAa2833d7F461D8751f1f46bF259fc4459C6/logo.png',
  },
  REP: {
    chainId: 43114,
    address: '0xb9924372Ddc7e7F13757C8B9ae0F03906a684D65',
    decimals: 18,
    name: 'Reputation',
    symbol: 'REP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xb9924372Ddc7e7F13757C8B9ae0F03906a684D65/logo.png',
  },
  REQ: {
    chainId: 43114,
    address: '0x8E729Ad67D81d220B7aB6e00440f785bD08187fE',
    decimals: 18,
    name: 'Request Token',
    symbol: 'REQ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8E729Ad67D81d220B7aB6e00440f785bD08187fE/logo.png',
  },
  RSR: {
    chainId: 43114,
    address: '0x91C20a30ebA9795BBdEd46df9ad5b215DFa04fcD',
    decimals: 18,
    name: 'Reserve Rights',
    symbol: 'RSR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x91C20a30ebA9795BBdEd46df9ad5b215DFa04fcD/logo.png',
  },
  RFuel: {
    chainId: 43114,
    address: '0x3361a925eCBa04e4De70C0Fa6310e710a2079a28',
    decimals: 18,
    name: 'Rio Fuel Token',
    symbol: 'RFuel',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3361a925eCBa04e4De70C0Fa6310e710a2079a28/logo.png',
  },
  RCN: {
    chainId: 43114,
    address: '0xd2427C8a8dA88c0Ea24370A971Dad6EEd2ff63b7',
    decimals: 18,
    name: 'Ripio Credit Network Token',
    symbol: 'RCN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd2427C8a8dA88c0Ea24370A971Dad6EEd2ff63b7/logo.png',
  },
  RWS: {
    chainId: 43114,
    address: '0x0Cb3Fe222303e1419EE73216e90322ae4635Fc5E',
    decimals: 18,
    name: 'Robonomics Web Services - V1',
    symbol: 'RWS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0Cb3Fe222303e1419EE73216e90322ae4635Fc5E/logo.png',
  },
  RPL: {
    chainId: 43114,
    address: '0x5cDAD843078930C8fEB1d50bE474acCf11B7ada1',
    decimals: 18,
    name: 'Rocket Pool',
    symbol: 'RPL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5cDAD843078930C8fEB1d50bE474acCf11B7ada1/logo.png',
  },
  ROOK: {
    chainId: 43114,
    address: '0x052c1e9de172366F30F300e805707a6520615977',
    decimals: 18,
    name: 'ROOK',
    symbol: 'ROOK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x052c1e9de172366F30F300e805707a6520615977/logo.png',
  },
  RBC: {
    chainId: 43114,
    address: '0x88f87bb181cd974f3AaE5002F5E6D4E1EB463f9C',
    decimals: 18,
    name: 'Rubic',
    symbol: 'RBC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x88f87bb181cd974f3AaE5002F5E6D4E1EB463f9C/logo.png',
  },
  RVT: {
    chainId: 43114,
    address: '0x26526EBD75Ed27d5B553d06d6bcE8210bA0bc50b',
    decimals: 18,
    name: 'RvT',
    symbol: 'RVT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x26526EBD75Ed27d5B553d06d6bcE8210bA0bc50b/logo.png',
  },
  SAFE2: {
    chainId: 43114,
    address: '0x2a1F8a24575261919f839f4254FdE9bc4b8edE7A',
    decimals: 18,
    name: 'SAFE2',
    symbol: 'SAFE2',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x2a1F8a24575261919f839f4254FdE9bc4b8edE7A/logo.png',
  },
  SAND: {
    chainId: 43114,
    address: '0xA29d60Ef9706571bBDa9b505A117e1D36a0D683C',
    decimals: 18,
    name: 'SAND',
    symbol: 'SAND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA29d60Ef9706571bBDa9b505A117e1D36a0D683C/logo.png',
  },
  SAN: {
    chainId: 43114,
    address: '0x8ae71C763700F22f1bb137F1D8767826d7f02d3a',
    decimals: 18,
    name: 'SANtiment network token',
    symbol: 'SAN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8ae71C763700F22f1bb137F1D8767826d7f02d3a/logo.png',
  },
  KEY: {
    chainId: 43114,
    address: '0x858950767B333d45B90C28709e97605e1829f907',
    decimals: 18,
    name: 'SelfKey',
    symbol: 'KEY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x858950767B333d45B90C28709e97605e1829f907/logo.png',
  },
  SHAKE: {
    chainId: 43114,
    address: '0x0680298EEA69e413eD02b393Fc269C2757033Ab0',
    decimals: 18,
    name: 'SHAKE token by SpaceSwap v2',
    symbol: 'SHAKE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0680298EEA69e413eD02b393Fc269C2757033Ab0/logo.png',
  },
  SHIP: {
    chainId: 43114,
    address: '0xCCD9a2fa0A31506E5D881981B702e9476feFAE56',
    decimals: 18,
    name: 'ShipChain SHIP',
    symbol: 'SHIP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xCCD9a2fa0A31506E5D881981B702e9476feFAE56/logo.png',
  },
  SPI: {
    chainId: 43114,
    address: '0xDCd9b9b00a7bA3afb6E8F5058945a1A946810D29',
    decimals: 18,
    name: 'Shopping.io',
    symbol: 'SPI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xDCd9b9b00a7bA3afb6E8F5058945a1A946810D29/logo.png',
  },
  ST: {
    chainId: 43114,
    address: '0x7De7dFE1A594BCBab1C0cd2AE0a530A019cE14Ed',
    decimals: 18,
    name: 'Simple Token',
    symbol: 'ST',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7De7dFE1A594BCBab1C0cd2AE0a530A019cE14Ed/logo.png',
  },
  SRN: {
    chainId: 43114,
    address: '0x3365A191353a7670CaAC8B4BE19C2F34DcD07320',
    decimals: 18,
    name: 'SIRIN',
    symbol: 'SRN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3365A191353a7670CaAC8B4BE19C2F34DcD07320/logo.png',
  },
  SNOW: {
    chainId: 43114,
    address: '0x40eB65be917e7A5AE529B2e1279E4b548A36C465',
    decimals: 18,
    name: 'SnowSwap',
    symbol: 'SNOW',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x40eB65be917e7A5AE529B2e1279E4b548A36C465/logo.png',
  },
  XOR: {
    chainId: 43114,
    address: '0x307A2a7127429f0C24c607E4633d17B6E98E8372',
    decimals: 18,
    name: 'Sora Token',
    symbol: 'XOR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x307A2a7127429f0C24c607E4633d17B6E98E8372/logo.png',
  },
  VAL: {
    chainId: 43114,
    address: '0x7583FD3Aa918896700F4F106Df7387e1943a31aa',
    decimals: 18,
    name: 'Sora Validator Token',
    symbol: 'VAL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7583FD3Aa918896700F4F106Df7387e1943a31aa/logo.png',
  },
  SPC: {
    chainId: 43114,
    address: '0x9E692659CdEDf13e85eADC38fCf7bC9F6329Db69',
    decimals: 18,
    name: 'SpaceChainV2',
    symbol: 'SPC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9E692659CdEDf13e85eADC38fCf7bC9F6329Db69/logo.png',
  },
  SPANK: {
    chainId: 43114,
    address: '0xAdcE0b08127EFd11d4A6CDAA82feDe77b0Fa57F9',
    decimals: 18,
    name: 'SPANK',
    symbol: 'SPANK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xAdcE0b08127EFd11d4A6CDAA82feDe77b0Fa57F9/logo.png',
  },
  SFI: {
    chainId: 43114,
    address: '0xC386282f66c090A1e42c39e83dBD2c2d447dE506',
    decimals: 18,
    name: 'Spice',
    symbol: 'SFI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC386282f66c090A1e42c39e83dBD2c2d447dE506/logo.png',
  },
  SPICE: {
    chainId: 43114,
    address: '0x9F7841A719e26cE4Ab7374806857f91C83F05f33',
    decimals: 18,
    name: 'Spice',
    symbol: 'SPICE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9F7841A719e26cE4Ab7374806857f91C83F05f33/logo.png',
  },
  SPD: {
    chainId: 43114,
    address: '0x3BfCDB1Ec986430ffF0e35C00D71888D305E48f3',
    decimals: 18,
    name: 'SPINDLE',
    symbol: 'SPD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3BfCDB1Ec986430ffF0e35C00D71888D305E48f3/logo.png',
  },
  STBZ: {
    chainId: 43114,
    address: '0x5a21a9e09667A67a898dE061D4bC61e92f20404e',
    decimals: 18,
    name: 'Stabilize Token',
    symbol: 'STBZ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5a21a9e09667A67a898dE061D4bC61e92f20404e/logo.png',
  },
  STAKE: {
    chainId: 43114,
    address: '0x540641C9B0fcb979496A8c03C711033239C841d5',
    decimals: 18,
    name: 'STAKE',
    symbol: 'STAKE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x540641C9B0fcb979496A8c03C711033239C841d5/logo.png',
  },
  SDT: {
    chainId: 43114,
    address: '0xC19CD5D80B52118A99B23941Eaf1bb58Bb79f1fa',
    decimals: 18,
    name: 'Stake DAO Token',
    symbol: 'SDT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC19CD5D80B52118A99B23941Eaf1bb58Bb79f1fa/logo.png',
  },
  STA: {
    chainId: 43114,
    address: '0x8194f4FE1fb50A945eB5dB226689066BE5E208D4',
    decimals: 18,
    name: 'Statera',
    symbol: 'STA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8194f4FE1fb50A945eB5dB226689066BE5E208D4/logo.png',
  },
  STONK: {
    chainId: 43114,
    address: '0x571FB151CC10F76d5A9a4b48f6D568Fb7E1eEbF8',
    decimals: 18,
    name: 'STONK',
    symbol: 'STONK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x571FB151CC10F76d5A9a4b48f6D568Fb7E1eEbF8/logo.png',
  },
  STMX: {
    chainId: 43114,
    address: '0xD6C7f1C0b553B820739A9bEFa30e1A4990DB67dC',
    decimals: 18,
    name: 'StormX',
    symbol: 'STMX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD6C7f1C0b553B820739A9bEFa30e1A4990DB67dC/logo.png',
  },
  STX: {
    chainId: 43114,
    address: '0x232F79C05CB34de19C79104068E76452B624baB3',
    decimals: 18,
    name: 'Stox',
    symbol: 'STX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x232F79C05CB34de19C79104068E76452B624baB3/logo.png',
  },
  STM: {
    chainId: 43114,
    address: '0xA62CBCB4F5485Ee6EF6B44083c561f9E1f2B740a',
    decimals: 18,
    name: 'Streamity',
    symbol: 'STM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA62CBCB4F5485Ee6EF6B44083c561f9E1f2B740a/logo.png',
  },
  DATA: {
    chainId: 43114,
    address: '0x7b73CEEed704556355D03aF8888da3bCD4434CF9',
    decimals: 18,
    name: 'Streamr DATAcoin',
    symbol: 'DATA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7b73CEEed704556355D03aF8888da3bCD4434CF9/logo.png',
  },
  STRONG: {
    chainId: 43114,
    address: '0xCf68248eeF35b725512724178Da55ad7DB59A5F1',
    decimals: 18,
    name: 'Strong',
    symbol: 'STRONG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xCf68248eeF35b725512724178Da55ad7DB59A5F1/logo.png',
  },
  SURF: {
    chainId: 43114,
    address: '0xfa0bDf9dF8bb8b3d7687a44dAD2F69Bc7a7B294f',
    decimals: 18,
    name: 'SURF.Finance',
    symbol: 'SURF',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xfa0bDf9dF8bb8b3d7687a44dAD2F69Bc7a7B294f/logo.png',
  },
  SUSHIe: {
    chainId: 43114,
    address: '0x37B608519F91f70F2EeB0e5Ed9AF4061722e4F76',
    decimals: 18,
    name: 'SushiToken',
    symbol: 'SUSHI',
    website: 'https://sushi.com/',
    description:
      'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc/logo.png',
  },
  SUSHI: {
    chainId: 43114,
    address: '0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc',
    decimals: 18,
    name: 'SushiToken',
    symbol: 'SUSHI',
    website: 'https://sushi.com/',
    description:
      'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x39cf1BD5f15fb22eC3D9Ff86b0727aFc203427cc/logo.png',
  },
  SWAG: {
    chainId: 43114,
    address: '0xE8ddE6E36ae86E3c61Dc13DFf908B4a12d50F754',
    decimals: 18,
    name: 'Swag Token',
    symbol: 'SWAG',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE8ddE6E36ae86E3c61Dc13DFf908B4a12d50F754/logo.png',
  },
  SWFL: {
    chainId: 43114,
    address: '0x733793e8F93afD40d9322a4FBA46de661e4F8B83',
    decimals: 18,
    name: 'Swapfolio',
    symbol: 'SWFL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x733793e8F93afD40d9322a4FBA46de661e4F8B83/logo.png',
  },
  SXP: {
    chainId: 43114,
    address: '0x3AfAD3EB65DeAf28f594958717530bC66D6Cdd1c',
    decimals: 18,
    name: 'Swipe',
    symbol: 'SXP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3AfAD3EB65DeAf28f594958717530bC66D6Cdd1c/logo.png',
  },
  ESH: {
    chainId: 43114,
    address: '0xCff97feeC839C59BA94FA453D47263a9Cf4d4C28',
    decimals: 18,
    name: 'Switch',
    symbol: 'ESH',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xCff97feeC839C59BA94FA453D47263a9Cf4d4C28/logo.png',
  },
  SYN: {
    chainId: 43114,
    address: '0x1f1E7c893855525b303f99bDF5c3c05Be09ca251',
    decimals: 18,
    name: 'Synapse Protocol',
    symbol: 'SYN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x09f60a231C989d0c5AdC9d3609936A3409885Bd0/logo.png',
  },
  SNX: {
    chainId: 43114,
    address: '0x68e44C4619db40ae1a0725e77C02587bC8fBD1c9',
    decimals: 18,
    name: 'Synthetix Network Token',
    symbol: 'SNX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x68e44C4619db40ae1a0725e77C02587bC8fBD1c9/logo.png',
  },
  TBTC: {
    chainId: 43114,
    address: '0x1c24D4ef397F6F8c80403f52E9D11Bef1D129a93',
    decimals: 18,
    name: 'tBTC',
    symbol: 'TBTC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1c24D4ef397F6F8c80403f52E9D11Bef1D129a93/logo.png',
  },
  TEND: {
    chainId: 43114,
    address: '0x9D8CA87A15230b112D90f9eEE7C1C6fDAB92cAed',
    decimals: 18,
    name: 'Tendies Token',
    symbol: 'TEND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9D8CA87A15230b112D90f9eEE7C1C6fDAB92cAed/logo.png',
  },
  PAY: {
    chainId: 43114,
    address: '0xBdFc6443428DEcf3cCDc7472DF5d96c2FA8C2E70',
    decimals: 18,
    name: 'TenX Pay Token',
    symbol: 'PAY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBdFc6443428DEcf3cCDc7472DF5d96c2FA8C2E70/logo.png',
  },
  TVK: {
    chainId: 43114,
    address: '0xbE53F019a8786227E3D258A47a0D96BCf24A09A6',
    decimals: 18,
    name: 'Terra Virtua Kolect',
    symbol: 'TVK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbE53F019a8786227E3D258A47a0D96BCf24A09A6/logo.png',
  },
  USDT: {
    chainId: 43114,
    address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    decimals: 6,
    name: 'Tether USD (native)',
    symbol: 'USDT',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://snowtrace.io/token/images/tether_32.png',
  },
  USDTo: {
    chainId: 43114,
    address: '0xde3A24028580884448a5397872046a019649b084',
    decimals: 6,
    name: 'Tether USD (bridged)',
    symbol: 'USDTo',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem. From Avalanche Bridge.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xde3A24028580884448a5397872046a019649b084/logo.png',
  },
  RUNE: {
    chainId: 43114,
    address: '0x390ba0fb0Bd3Aa2a5484001606329701148074e6',
    decimals: 18,
    name: 'THORChain ETH.RUNE',
    symbol: 'RUNE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x390ba0fb0Bd3Aa2a5484001606329701148074e6/logo.png',
  },
  TBX: {
    chainId: 43114,
    address: '0xbAb918cfBD3c53Ce1516E6AA97c8342B15c26BcC',
    decimals: 18,
    name: 'Tokenbox',
    symbol: 'TBX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbAb918cfBD3c53Ce1516E6AA97c8342B15c26BcC/logo.png',
  },
  TOMOE: {
    chainId: 43114,
    address: '0x7657F9ee5f31868CcaC0EC4306a92B0E2F5660d2',
    decimals: 18,
    name: 'TomoChain',
    symbol: 'TOMOE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7657F9ee5f31868CcaC0EC4306a92B0E2F5660d2/logo.png',
  },
  TORN: {
    chainId: 43114,
    address: '0x7CCF19824c351e57C00633b46bbbff495E12d89d',
    decimals: 18,
    name: 'TornadoCash',
    symbol: 'TORN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7CCF19824c351e57C00633b46bbbff495E12d89d/logo.png',
  },
  DIS: {
    chainId: 43114,
    address: '0xf981547a1D9A0c59C9aba1e2b826BF01a2e5E263',
    decimals: 18,
    name: 'TosDis',
    symbol: 'DIS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf981547a1D9A0c59C9aba1e2b826BF01a2e5E263/logo.png',
  },
  TRAC: {
    chainId: 43114,
    address: '0xdEA3Da33bDee64487358DB66d9AbC9EC256D1BFb',
    decimals: 18,
    name: 'Trace Token',
    symbol: 'TRAC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xdEA3Da33bDee64487358DB66d9AbC9EC256D1BFb/logo.png',
  },
  TNS: {
    chainId: 43114,
    address: '0x6b944c575376460edC27Be19c999654E5982D971',
    decimals: 18,
    name: 'Transcodium',
    symbol: 'TNS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x6b944c575376460edC27Be19c999654E5982D971/logo.png',
  },
  TRND: {
    chainId: 43114,
    address: '0x3a2d191AE83223ed0668d9AAF180Be147Ec05ad3',
    decimals: 18,
    name: 'Trendering',
    symbol: 'TRND',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3a2d191AE83223ed0668d9AAF180Be147Ec05ad3/logo.png',
  },
  TAUD: {
    chainId: 43114,
    address: '0x82913383A48712C6A876E611A0412395B86e74B1',
    decimals: 18,
    name: 'TrueAUD',
    symbol: 'TAUD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x82913383A48712C6A876E611A0412395B86e74B1/logo.png',
  },
  TCAD: {
    chainId: 43114,
    address: '0xbf65c0f333954EBC49aab45fB6F04Bee27F72495',
    decimals: 18,
    name: 'TrueCAD',
    symbol: 'TCAD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbf65c0f333954EBC49aab45fB6F04Bee27F72495/logo.png',
  },
  TGBP: {
    chainId: 43114,
    address: '0x9018775d36d3e39AE5d88a5F502d4cBe430734C5',
    decimals: 18,
    name: 'TrueGBP',
    symbol: 'TGBP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9018775d36d3e39AE5d88a5F502d4cBe430734C5/logo.png',
  },
  THKD: {
    chainId: 43114,
    address: '0xc8Eb95dac0033024B4b3fc87569824C4416F495d',
    decimals: 18,
    name: 'TrueHKD',
    symbol: 'THKD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xc8Eb95dac0033024B4b3fc87569824C4416F495d/logo.png',
  },
  TRUST: {
    chainId: 43114,
    address: '0x0B483a7E8119d9f9FbFF4a86cd751c51B6a81af9',
    decimals: 18,
    name: 'TRUST DAO',
    symbol: 'TRUST',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0B483a7E8119d9f9FbFF4a86cd751c51B6a81af9/logo.png',
  },
  TLN: {
    chainId: 43114,
    address: '0xC394FBa894e6cD201478BC0F2EF121Acb3182EB4',
    decimals: 18,
    name: 'Trustlines Network Token',
    symbol: 'TLN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC394FBa894e6cD201478BC0F2EF121Acb3182EB4/logo.png',
  },
  SWAP: {
    chainId: 43114,
    address: '0x17908a369a1884Ce287Bf79c269a16F0Fb84082E',
    decimals: 18,
    name: 'TrustSwap Token',
    symbol: 'SWAP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x17908a369a1884Ce287Bf79c269a16F0Fb84082E/logo.png',
  },
  '2KEY': {
    chainId: 43114,
    address: '0x3F6372f530203daA26eF31F55017a36d6f7405E5',
    decimals: 18,
    name: 'TwoKeyEconomy',
    symbol: '2KEY',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3F6372f530203daA26eF31F55017a36d6f7405E5/logo.png',
  },
  PHOON: {
    chainId: 43114,
    address: '0xFb59DE6961D7D7D153bb82FCBCc2a7F5Da8Db56D',
    decimals: 18,
    name: 'Typhoon',
    symbol: 'PHOON',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xFb59DE6961D7D7D153bb82FCBCc2a7F5Da8Db56D/logo.png',
  },
  uDOO: {
    chainId: 43114,
    address: '0xeaa4F0C8bDC6109C92f0A5bE88A035ee11D40928',
    decimals: 18,
    name: 'uDOO',
    symbol: 'uDOO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xeaa4F0C8bDC6109C92f0A5bE88A035ee11D40928/logo.png',
  },
  UMA: {
    chainId: 43114,
    address: '0xC84d7bfF2555955b44BDF6A307180810412D751B',
    decimals: 18,
    name: 'UMA Voting Token v1',
    symbol: 'UMA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xC84d7bfF2555955b44BDF6A307180810412D751B/logo.png',
  },
  UCAP: {
    chainId: 43114,
    address: '0x8C32D46C073694045E8409251BE1FFD6720a94F3',
    decimals: 18,
    name: 'UniCap.finance',
    symbol: 'UCAP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8C32D46C073694045E8409251BE1FFD6720a94F3/logo.png',
  },
  UNC: {
    chainId: 43114,
    address: '0xD084b89B8f04f3E2360EBd600360C358aA122BfB',
    decimals: 18,
    name: 'UniCrypt',
    symbol: 'UNC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD084b89B8f04f3E2360EBd600360C358aA122BfB/logo.png',
  },
  LAYER: {
    chainId: 43114,
    address: '0xF8342EBdc7C4860Fe16eaB3318ddA110305F6597',
    decimals: 18,
    name: 'Unilayer',
    symbol: 'LAYER',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF8342EBdc7C4860Fe16eaB3318ddA110305F6597/logo.png',
  },
  UFT: {
    chainId: 43114,
    address: '0xF5182C77B4a5Dd11a59a83FB54aBaf7Dd3099041',
    decimals: 18,
    name: 'UniLend Finance Token',
    symbol: 'UFT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF5182C77B4a5Dd11a59a83FB54aBaf7Dd3099041/logo.png',
  },
  POWER: {
    chainId: 43114,
    address: '0xFBD70543a1456ECa6570743256dc2D6E5CE43a2e',
    decimals: 18,
    name: 'UniPower',
    symbol: 'POWER',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xFBD70543a1456ECa6570743256dc2D6E5CE43a2e/logo.png',
  },
  UNIe: {
    chainId: 43114,
    address: '0x8eBAf22B6F053dFFeaf46f4Dd9eFA95D89ba8580',
    decimals: 18,
    name: 'Uniswap',
    symbol: 'UNI',
    website: 'https://uniswap.org/',
    description:
      'UNI is the governance token for Uniswap. UNI was introduced on 16th September 2020 through a retrospective airdrop to users who have interacted with the protocol either by swapping tokens or by providing liquidity.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf39f9671906d8630812f9d9863bBEf5D523c84Ab/logo.png',
  },
  UNI: {
    chainId: 43114,
    address: '0xf39f9671906d8630812f9d9863bBEf5D523c84Ab',
    decimals: 18,
    name: 'Uniswap',
    symbol: 'UNI',
    website: 'https://uniswap.org/',
    description:
      'UNI is the governance token for Uniswap. UNI was introduced on 16th September 2020 through a retrospective airdrop to users who have interacted with the protocol either by swapping tokens or by providing liquidity.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf39f9671906d8630812f9d9863bBEf5D523c84Ab/logo.png',
  },
  TRADE: {
    chainId: 43114,
    address: '0xc95d97181857469f7d3CcACB20a84fC0Dfd69a1b',
    decimals: 18,
    name: 'UniTrade',
    symbol: 'TRADE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xc95d97181857469f7d3CcACB20a84fC0Dfd69a1b/logo.png',
  },
  '1UP': {
    chainId: 43114,
    address: '0x7fB11D8945653F0978cCA2Ef51442bF31c84e142',
    decimals: 18,
    name: 'Uptrennd',
    symbol: '1UP',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x7fB11D8945653F0978cCA2Ef51442bF31c84e142/logo.png',
  },
  USDK: {
    chainId: 43114,
    address: '0x28A9f61B5dB4F4349C2edFE7a9B234f71e4ad2A7',
    decimals: 18,
    name: 'USDK',
    symbol: 'USDK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x28A9f61B5dB4F4349C2edFE7a9B234f71e4ad2A7/logo.png',
  },
  USDQ: {
    chainId: 43114,
    address: '0x4247beA779fE14dabD38547A7eA49d7f57bd1bea',
    decimals: 18,
    name: 'USDQ Stablecoin by Q DAO v1.0',
    symbol: 'USDQ',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4247beA779fE14dabD38547A7eA49d7f57bd1bea/logo.png',
  },
  UTK: {
    chainId: 43114,
    address: '0x994921baDc83D4F16eEde22B81b64162c50A49EB',
    decimals: 18,
    name: 'Utrust Token',
    symbol: 'UTK',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x994921baDc83D4F16eEde22B81b64162c50A49EB/logo.png',
  },
  VALOR: {
    chainId: 43114,
    address: '0x5499B77D5Ddc35680A26Ff270D96A5c2eB859df4',
    decimals: 18,
    name: 'ValorToken',
    symbol: 'VALOR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5499B77D5Ddc35680A26Ff270D96A5c2eB859df4/logo.png',
  },
  VALUE: {
    chainId: 43114,
    address: '0x05Fe3039ecc7E03342521f583e9B3bb8B1bf5EB1',
    decimals: 18,
    name: 'Value Liquidity',
    symbol: 'VALUE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x05Fe3039ecc7E03342521f583e9B3bb8B1bf5EB1/logo.png',
  },
  VIB: {
    chainId: 43114,
    address: '0x81C8d264f14bF69a083446Fd19fFE9A8fE80E3C0',
    decimals: 18,
    name: 'Vibe',
    symbol: 'VIB',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x81C8d264f14bF69a083446Fd19fFE9A8fE80E3C0/logo.png',
  },
  VIDT: {
    chainId: 43114,
    address: '0xE1Df06E09531aeD339Cf6C97bEb59De94675d5a8',
    decimals: 18,
    name: 'VIDT Datalink',
    symbol: 'VIDT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE1Df06E09531aeD339Cf6C97bEb59De94675d5a8/logo.png',
  },
  VSN: {
    chainId: 43114,
    address: '0x3aCf5DfE16cE85ED98339Dfebf2283537F2229d0',
    decimals: 18,
    name: 'Vision Network',
    symbol: 'VSN',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3aCf5DfE16cE85ED98339Dfebf2283537F2229d0/logo.png',
  },
  WINGS: {
    chainId: 43114,
    address: '0xB6F1A43ccc654026DEAd1b566b948dBFBa23f75A',
    decimals: 18,
    name: 'WINGS',
    symbol: 'WINGS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB6F1A43ccc654026DEAd1b566b948dBFBa23f75A/logo.png',
  },
  WISE: {
    chainId: 43114,
    address: '0x5940b937d1dc86Bd44E535b75C95e9bA10e1ac33',
    decimals: 18,
    name: 'Wise Token',
    symbol: 'WISE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5940b937d1dc86Bd44E535b75C95e9bA10e1ac33/logo.png',
  },
  wANATHA: {
    chainId: 43114,
    address: '0xD3e6c7E9Dc08173276A17d23546cb9C24D7cD7b0',
    decimals: 18,
    name: 'Wrapped ANATHA',
    symbol: 'wANATHA',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xD3e6c7E9Dc08173276A17d23546cb9C24D7cD7b0/logo.png',
  },
  WBTC: {
    chainId: 43114,
    address: '0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  WBTCe: {
    chainId: 43114,
    address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTCe',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  renBTC: {
    chainId: 43114,
    address: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
    decimals: 8,
    name: 'renBTC',
    symbol: 'RENBTC',
    website: 'https://renproject.io/',
    description:
      'renBTC is a synthetic asset that represents the value of bitcoin and it is created by the Ren protocol. renBTC allows for bitcoin transfers to be conducted quicker on the Ethereum blockchain and opens up the possibility for bitcoin to be used in the Ethereum ecosystem. Bitcoin is held in custody by a network of decentralized nodes; it can be converted to renBTC and vice versa easily.',
    logoURI:
      'https://raw.githubusercontent.com/renproject/bridge-v2/master/src/assets/icons/tokens/bitcoin-dashed-icon.svg',
  },
  wNXM: {
    chainId: 43114,
    address: '0x3585E1f43Af5A0E5a9429A8058BDf999ED67f81d',
    decimals: 18,
    name: 'Wrapped NXM',
    symbol: 'wNXM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3585E1f43Af5A0E5a9429A8058BDf999ED67f81d/logo.png',
  },
  X8X: {
    chainId: 43114,
    address: '0x974E0e514D1413001201D5a629fF8dEfd188E3fd',
    decimals: 18,
    name: 'X8XToken',
    symbol: 'X8X',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x974E0e514D1413001201D5a629fF8dEfd188E3fd/logo.png',
  },
  XDCE: {
    chainId: 43114,
    address: '0x3a162d08Fbfa687Ca00F5682c5c4F51b3aEe181C',
    decimals: 18,
    name: 'XinFin XDCE',
    symbol: 'XDCE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x3a162d08Fbfa687Ca00F5682c5c4F51b3aEe181C/logo.png',
  },
  XIO: {
    chainId: 43114,
    address: '0x1Ce24Ac9EC3fbc4BA0c3836123953EA0c86336b9',
    decimals: 18,
    name: 'XIO Network',
    symbol: 'XIO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1Ce24Ac9EC3fbc4BA0c3836123953EA0c86336b9/logo.png',
  },
  YAX: {
    chainId: 43114,
    address: '0x977788025632E20360E4bB4867ef2C498A4EE4a6',
    decimals: 18,
    name: 'yAxis',
    symbol: 'YAX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x977788025632E20360E4bB4867ef2C498A4EE4a6/logo.png',
  },
  'yyDAI+yUSDC+yUSDT': {
    chainId: 43114,
    address: '0x23f717b177eaf0bB93a726D2b8C4Bd11d4c4950b',
    decimals: 18,
    name: 'yearn Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
    symbol: 'yyDAI+yUSDC+yUSDT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x23f717b177eaf0bB93a726D2b8C4Bd11d4c4950b/logo.png',
  },
  YFIe: {
    chainId: 43114,
    address: '0x9eAaC1B23d935365bD7b542Fe22cEEe2922f52dc',
    decimals: 18,
    name: 'yearn.finance',
    symbol: 'YFI',
    website: 'https://yearn.finance/',
    description:
      'Yearn Finance is a suite of products in Decentralized Finance (DeFi) that provides lending aggregation, yield generation, and insurance on the Ethereum blockchain. The protocol is maintained by various independent developers and is governed by YFI holders.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x99519AcB025a0e0d44c3875A4BbF03af65933627/logo.png',
  },
  YFI: {
    chainId: 43114,
    address: '0x99519AcB025a0e0d44c3875A4BbF03af65933627',
    decimals: 18,
    name: 'yearn.finance',
    symbol: 'YFI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x99519AcB025a0e0d44c3875A4BbF03af65933627/logo.png',
  },
  YFM: {
    chainId: 43114,
    address: '0xFC492B9DC6aDE871c20e9169f2600DFd2718dF4E',
    decimals: 18,
    name: 'yfarm.finance',
    symbol: 'YFM',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xFC492B9DC6aDE871c20e9169f2600DFd2718dF4E/logo.png',
  },
  'Yf-DAI': {
    chainId: 43114,
    address: '0xE09CD46BBE2144b53C6265c2D1B3d01cfDadB786',
    decimals: 18,
    name: 'YfDAI.finance',
    symbol: 'Yf-DAI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE09CD46BBE2144b53C6265c2D1B3d01cfDadB786/logo.png',
  },
  YFFI: {
    chainId: 43114,
    address: '0x5777E014b585A5F05dB9902ef944Df9C45F2054C',
    decimals: 18,
    name: 'yffi.finance',
    symbol: 'YFFI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5777E014b585A5F05dB9902ef944Df9C45F2054C/logo.png',
  },
  YFII: {
    chainId: 43114,
    address: '0xA0e1645A594a3ac2556Ad0707D89B908B1A17d03',
    decimals: 18,
    name: 'YFII.finance',
    symbol: 'YFII',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xA0e1645A594a3ac2556Ad0707D89B908B1A17d03/logo.png',
  },
  YFL: {
    chainId: 43114,
    address: '0xE3a13E41eCAdcc611a5D8415c2b8C0802197bA96',
    decimals: 18,
    name: 'YFLink',
    symbol: 'YFL',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xE3a13E41eCAdcc611a5D8415c2b8C0802197bA96/logo.png',
  },
  YFV: {
    chainId: 43114,
    address: '0xd79FA6aC3D484CbbcbE3208518bD4Ae03519E0DB',
    decimals: 18,
    name: 'YFValue',
    symbol: 'YFV',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xd79FA6aC3D484CbbcbE3208518bD4Ae03519E0DB/logo.png',
  },
  SAFE: {
    chainId: 43114,
    address: '0x0439b92098Bf71Dd4AbF1bA73B974a8c52f1F5F3',
    decimals: 18,
    name: 'yieldfarming.insure',
    symbol: 'SAFE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x0439b92098Bf71Dd4AbF1bA73B974a8c52f1F5F3/logo.png',
  },
  ZERO: {
    chainId: 43114,
    address: '0x9Bdd302e506C3F6c23c085C37789cce6d3C1a233',
    decimals: 18,
    name: 'Zero.Exchange Token',
    symbol: 'ZERO',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x9Bdd302e506C3F6c23c085C37789cce6d3C1a233/logo.png',
  },
  ZEE: {
    chainId: 43114,
    address: '0x58DC26DA5bfc714F73fD4a4dc768901ed9B8Ed1a',
    decimals: 18,
    name: 'ZeroSwapToken',
    symbol: 'ZEE',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x58DC26DA5bfc714F73fD4a4dc768901ed9B8Ed1a/logo.png',
  },
  ZINC: {
    chainId: 43114,
    address: '0x14B1f37c46ECf29C9657585DF0Dd7CEe1eC7C569',
    decimals: 18,
    name: 'ZINC',
    symbol: 'ZINC',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x14B1f37c46ECf29C9657585DF0Dd7CEe1eC7C569/logo.png',
  },
  ZIPT: {
    chainId: 43114,
    address: '0x5ED880a1a8e25515D2e881eEBa115462b824Ac5B',
    decimals: 18,
    name: 'Zippie',
    symbol: 'ZIPT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x5ED880a1a8e25515D2e881eEBa115462b824Ac5B/logo.png',
  },
  ZKS: {
    chainId: 43114,
    address: '0x40871A08cd7b9751639a0831e5a83808F4c7EBA9',
    decimals: 18,
    name: 'Zks',
    symbol: 'ZKS',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x40871A08cd7b9751639a0831e5a83808F4c7EBA9/logo.png',
  },
  zLOT: {
    chainId: 43114,
    address: '0xF9F0BB57D247a8c55c463b9a231de7E998bdc9a0',
    decimals: 18,
    name: 'zLOT',
    symbol: 'zLOT',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xF9F0BB57D247a8c55c463b9a231de7E998bdc9a0/logo.png',
  },
  'DAI-Dai Stablecoin v1.0': {
    chainId: 43114,
    address: '0x095370AE41FF23798d96c1ADF7D58Ae6a2b05b18',
    decimals: 18,
    name: 'Dai Stablecoin v1.0',
    symbol: 'DAI',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x095370AE41FF23798d96c1ADF7D58Ae6a2b05b18/logo.png',
  },
  MKR: {
    chainId: 43114,
    address: '0x8DF92E9C0508aB0030d432DA9F2C65EB1Ee97620',
    decimals: 18,
    name: 'Maker',
    symbol: 'MKR',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x8DF92E9C0508aB0030d432DA9F2C65EB1Ee97620/logo.png',
  },
  'PNG-Pangolin': {
    address: '0x60781C2586D68229fde47564546784ab3fACA982',
    chainId: 43114,
    name: 'Pangolin',
    symbol: 'PNG',
    website: 'https://pangolin.exchange/',
    description:
      'A community-driven decentralized exchange for Avalanche and Ethereum assets with fast settlement, low transaction fees, and a democratic distribution–powered by Avalanche. Pangolin brings you the best trading opportunities to find and maximize your yield.',
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x60781C2586D68229fde47564546784ab3fACA982/logo.png',
  },
  COM: {
    chainId: 43114,
    address: '0x3711c397B6c8F7173391361e27e67d72F252cAad',
    decimals: 18,
    name: 'COMPLUS',
    symbol: 'COM',
    website: 'https://complus.exchange/',
    description:
      'Complus Network is a multi-chain exchange protocol for ERC-20 tokens on several blockchains.',
    logoURI:
      'https://raw.githubusercontent.com/complusnetwork/default-token-list/master/src/ava/0x3711c397B6c8F7173391361e27e67d72F252cAad/logo.png',
  },
  YTS: {
    chainId: 43114,
    address: '0x488F73cddDA1DE3664775fFd91623637383D6404',
    decimals: 18,
    name: 'YetiSwap',
    symbol: 'YTS',
    logoURI:
      'https://raw.githubusercontent.com/YetiSwap/yetiswap.app/master/src/assets/image/YTSCoin.png',
  },
  'ZERO-Zero.Exchange Token': {
    chainId: 43114,
    address: '0x008E26068B3EB40B443d3Ea88c1fF99B789c10F7',
    decimals: 18,
    name: 'Zero.Exchange Token',
    symbol: 'ZERO',
  },
  SNOB: {
    chainId: 43114,
    address: '0xC38f41A296A4493Ff429F1238e030924A1542e50',
    decimals: 18,
    name: 'Snowball',
    symbol: 'SNOB',
    website: 'https://snowball.network/',
    description:
      'Snowball combines multiple DeFi protocols to create an interconnected experience. Swap stablecoins, deposit liquidity, or auto-compound liquidity rewards.',
    logoURI: 'https://raw.githubusercontent.com/Snowball-Finance/Assets/main/Uphill%20snowball.png',
  },
  'SFI-sled.finance': {
    chainId: 43114,
    address: '0x1F1FE1eF06ab30a791d6357FdF0a7361B39b1537',
    decimals: 9,
    name: 'sled.finance',
    symbol: 'SFI',
    logoURI: 'https://raw.githubusercontent.com/sled-finance/media/main/sled_token_fl.png',
  },
  SPORE: {
    chainId: 43114,
    address: '0x6e7f5C0b9f4432716bDd0a77a3601291b9D9e985',
    decimals: 9,
    name: 'Spore',
    symbol: 'SPORE',
    logoURI:
      'https://raw.githubusercontent.com/sporeproject/Spore-frontend/master/src/utils/SPORE.png',
  },
  PEFI: {
    chainId: 43114,
    address: '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c',
    decimals: 18,
    name: 'Penguin Finance',
    symbol: 'PEFI',
    logoURI: 'https://raw.githubusercontent.com/Penguin-Finance/png-files/main/PEFILOGOPNG.png',
  },
  aaBLOCK: {
    address: '0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50',
    chainId: 43114,
    name: 'Blocknet',
    symbol: 'aaBLOCK',
    decimals: 8,
    logoURI:
      'https://github.com/blocknetdx/documentation/blob/master/docs/img/icons/Blocknet_symbol_dark_RGB.png',
  },
  LYD: {
    chainId: 43114,
    address: '0x4C9B4E1AC6F24CdE3660D5E4Ef1eBF77C710C084',
    decimals: 18,
    name: 'Lydia Finance',
    symbol: 'LYD',
    website: 'https://www.lydia.finance/',
    description: 'Lydia Finance is a decentralized exchange (DEX) running on Avalanche.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4C9B4E1AC6F24CdE3660D5E4Ef1eBF77C710C084/logo.png',
  },
  VSO: {
    chainId: 43114,
    address: '0x846D50248BAf8b7ceAA9d9B53BFd12d7D7FBB25a',
    decimals: 18,
    name: 'Verso',
    symbol: 'VSO',
    logoURI: 'https://raw.githubusercontent.com/VersoOfficial/pr/master/icon_blue.png',
  },
  AVME: {
    chainId: 43114,
    address: '0x1ECd47FF4d9598f89721A2866BFEb99505a413Ed',
    decimals: 18,
    name: 'AV Me',
    symbol: 'AVME',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1ECd47FF4d9598f89721A2866BFEb99505a413Ed/logo.png',
  },
  CRACK: {
    chainId: 43114,
    address: '0xE9D00cBC5f02614d7281D742E6E815A47ce31107',
    decimals: 9,
    name: 'Crack.Fi',
    symbol: 'CRACK',
    logoURI: 'https://raw.githubusercontent.com/crackfi/logo/master/crackfi_png.png',
  },
  HUSKY: {
    chainId: 43114,
    address: '0x65378b697853568dA9ff8EaB60C13E1Ee9f4a654',
    decimals: 18,
    name: 'Husky Avalanche',
    symbol: 'HUSKY',
    logoURI: 'https://raw.githubusercontent.com/safepoint-be/project-husky/main/img/logo.png',
  },
  GDL: {
    chainId: 43114,
    address: '0xD606199557c8Ab6F4Cc70bD03FaCc96ca576f142',
    decimals: 18,
    name: 'Gondola',
    symbol: 'GDL',
    logoURI:
      'https://raw.githubusercontent.com/gondola-finance/frontend/master/src/assets/icons/brand_logo_darkmode.png',
  },
  CYCLE: {
    chainId: 43114,
    address: '0x81440C939f2C1E34fc7048E518a637205A632a74',
    decimals: 18,
    name: 'Cycle Protocol',
    symbol: 'CYCLE',
    logoURI:
      'https://raw.githubusercontent.com/CycleProtocol/assets/master/cycle-logo-round-small.png',
  },
  'BIRD-Birdy Finance': {
    chainId: 43114,
    address: '0x4480B4DdFb15fE6518817ef024D8B493afF2Db54',
    decimals: 18,
    name: 'Birdy Finance',
    symbol: 'BIRD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x4480B4DdFb15fE6518817ef024D8B493afF2Db54/logo.png',
  },
  XAVA: {
    chainId: 43114,
    address: '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4',
    decimals: 18,
    name: 'Avalaunch',
    symbol: 'XAVA',
    website: 'https://avalaunch.app/',
    description: 'Interoperable Token Pools & Auctions for the Avalanche Blockchain.',
    logoURI: 'https://raw.githubusercontent.com/avalaunch-app/xava-protocol/master/logo.png',
  },
  TESLABTC: {
    chainId: 43114,
    address: '0x8349088C575cA45f5A63947FEAeaEcC41136fA01',
    decimals: 9,
    name: 'TeslaBitcoin',
    symbol: 'TESLABTC',
    logoURI:
      'https://raw.githubusercontent.com/crackfi/tesla_btc_logo/master/Tesla_Bitcoin_logo.png',
  },
  USDTe: {
    chainId: 43114,
    address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    decimals: 6,
    name: 'Tether USD',
    symbol: 'USDTe',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.  This version is bridged from Ethereum.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xde3A24028580884448a5397872046a019649b084/logo.png',
  },
  TUSD: {
    chainId: 43114,
    address: '0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB',
    decimals: 18,
    name: 'TrueUSD',
    symbol: 'TUSD',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB/logo.png',
  },
  DAIe: {
    chainId: 43114,
    address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    decimals: 18,
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a/logo.png',
  },
  BUSDe: {
    chainId: 43114,
    address: '0x19860CCB0A68fd4213aB9D8266F7bBf05A8dDe98',
    decimals: 18,
    name: 'Binance USD',
    symbol: 'BUSD',
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos). BUSD is approved and regulated by the New York State Department of Financial Services (NYDFS). The BUSD Monthly Audit Report can be viewed from the official website.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/tokens/BUSD/logo.png',
  },
  'FRAX-Frax': {
    chainId: 43114,
    address: '0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98',
    decimals: 18,
    name: 'Frax',
    symbol: 'FRAX',
    website: 'https://frax.finance/',
    description:
      'Frax is the world’s first fractional-algorithmic stablecoin. The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xDC42728B0eA910349ed3c6e1c9Dc06b5FB591f98/logo.png',
  },
  OLIVE: {
    chainId: 43114,
    address: '0x617724974218A18769020A70162165A539c07E8a',
    decimals: 18,
    name: 'Olive',
    symbol: 'OLIVE',
    website: 'https://avax.olive.cash/',
    description:
      'OLIVE token is at the heart of the OliveCash ecosystem. Buy it, win it, farm it, spend it, stake it... heck, you can even vote with it!',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x617724974218A18769020A70162165A539c07E8a/logo.png',
  },
  JOE: {
    chainId: 43114,
    address: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd',
    decimals: 18,
    name: 'Joe Token',
    symbol: 'JOE',
    website: 'https://www.traderjoexyz.com/#/home',
    description:
      'Trader Joe is your one-stop decentralized trading platform on the Avalanche network, of which JOE is the governance token that rewards its holders with a share of exchange revenues.',
    logoURI: 'https://www.traderjoexyz.com/static/media/logo.bc60f78d.png',
  },
  SHIBX: {
    chainId: 43114,
    address: '0x440aBbf18c54b2782A4917b80a1746d3A2c2Cce1',
    decimals: 18,
    name: 'SHIBA',
    symbol: 'SHIBX',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x617724974218A18769020A70162165A539c07E8a/logo.png',
  },
  USDCe: {
    chainId: 43114,
    address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDCe',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d.png',
  },
  MIM: {
    name: 'Magic Internet Money',
    address: '0x130966628846BFd36ff31a822705796e8cb8C18D',
    symbol: 'MIM',
    decimals: 18,
    chainId: 43114,
    website: 'https://abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    logoURI: '',
  },
  SPELL: {
    name: 'albracabra',
    address: '0xCE1bFFBD5374Dac86a2893119683F4911a2F7814',
    symbol: 'SPELL',
    decimals: 18,
    chainId: 43114,
    website: 'https://abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    logoURI: '',
  },
  CRA: {
    name: 'CRA',
    symbol: 'CRA',
    address: '0xA32608e873F9DdEF944B24798db69d80Bbb4d1ed',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xA32608e873F9DdEF944B24798db69d80Bbb4d1ed.svg',
    website: 'https://www.crabada.com/',
    description:
      'Rediscover the prosperous ancient Crabada Kingdom once ruled by Crustaco, King of the Crabada. Mine. Loot. Breed. Expand your forces. Earn CRA tokens by playing and use them to determine the future of the Kingdom!',
  },
  aWOOL: {
    name: 'AWOOL',
    symbol: 'aWOOL',
    address: '0x5eDE350E84223fb50775fD91a723F2ca71034cf7',
    chainId: 43114,
    decimals: 9,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x5eDE350E84223fb50775fD91a723F2ca71034cf7.svg',
    website: 'https://www.sheepgamexyz.com/',
    description:
      'Wolf.Game pioneered new types of NFT mechanics BUT SheepGame brings it to Avalanche! Fully decentralized. Low Fees and Sub Second Finality and fully functional! SheepGame shows what’s possible with interactions between the ERC-20 and ERC-721 protocols on Avalanche. For the very first time, your NFT can steal other NFTs (ERC-721) for you. The rarer your NFT, the more tokens youll accumulate probabilistically!',
  },
  MEAD: {
    name: 'THORS MEAD',
    symbol: 'MEAD',
    address: '0x245C2591403e182e41d7A851eab53B01854844CE',
    chainId: 43114,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x245C2591403e182e41d7A851eab53B01854844CE.svg',
    website: 'https://asgarddao.fi/',
    description:
      'Asgard also introduces economic and game-theoretic dynamics into the market through forging (Staking) and pledging (Minting). Our goal is to build a policy-controlled currency system, native on the Avalanche Network, that is based on the VOLT token! ',
  },
  KLO: {
    name: 'Kalao Token',
    symbol: 'KLO',
    address: '0xb27c8941a7Df8958A1778c0259f76D1F8B711C35',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xb27c8941a7Df8958A1778c0259f76D1F8B711C35.svg',
    website: 'https://www.kalao.io/',
    description:
      'Kalao is an NFT ecosystem. We offer a cost-effective and easy-to-use Marketplace, powered by a combination of the Avalanche blockchain technology and outstanding Kalao VR capabilities. The Kalao framework will accelerate the adoption of VR technology to develop virtual worlds and sustain the digital transformation of business use cases.',
  },
  CRAFT: {
    name: 'CRAFT',
    symbol: 'CRAFT',
    address: '0x8aE8be25C23833e0A01Aa200403e826F611f9CD2',
    chainId: 43114,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x8aE8be25C23833e0A01Aa200403e826F611f9CD2.svg',
    website: 'https://talecraft.io/',
    description:
      'TaleCraft is a PVP, play-to-earn card board game, driven by a unique mint and craft mechanic, where players grow more powerful through gamified NFT alchemy. Elemental base cards are sold weekly, allowing only the most skilled alchemists to thrive and progress in this medieval metaverse. All NFT holders will receive AVAX yield generated by the game ecosystem, rewarding the most loyal and skilled holders. NFT & Token Deflation System TaleCraft leverages a brand new type of NFT minting process that balances game design and scarcity, designed to produce a sustainable, long-term economy. Crafting Technology achieves this, in part, by burning base cards to craft higher-tier cards, combing scarcity with game theory. Additionally, when chests are opened with $CRAFT, they are both burnt and used for vital liquidity--bolstering the entire game economy. The NFT’s total supply will be determined and balanced by community demand driven by free market principles.',
  },
  MELT: {
    name: 'Defrost Finance Token',
    symbol: 'MELT',
    address: '0x47EB6F7525C1aA999FBC9ee92715F5231eB1241D',
    chainId: 43114,
    decimals: 18,
    logoURI: '',
    website: 'https://www.defrost.finance/home',
    description:
      'Defrost Finance is the platform behind the next generation stablecoin and provides remunerative investment opportunities. A fully fair launch, decentralized project, its aim is to change the world of finance for good.',
  },
  PTP: {
    chainId: 43114,
    address: '0x22d4002028f537599bE9f666d1c4Fa138522f9c8',
    decimals: 18,
    name: 'Platypus',
    symbol: 'PTP',
    website: 'https://platypus.finance/',
    description:
      'Platypus invents a whole new AMM on Avalanche - Open liquidity single-sided AMM managing risk autonomously based on the coverage ratio, allowing maximal capital efficiency.',
    logoURI: 'https://img.api.cryptorank.io/coins/platypus%20finance1639051361866.png',
  },
  CLY: {
    chainId: 43114,
    address: '0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6',
    decimals: 18,
    name: 'Colony Token',
    symbol: 'CLY',
    website: 'https://www.colonylab.io/',
    description:
      'Colony is a community-driven Avalanche ecosystem accelerator, powered by Colony’s CLY token.',
    logoURI: 'https://assets.coingecko.com/coins/images/21358/large/colony.PNG?1639013005',
  },
  USDC: {
    chainId: 43114,
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d.png',
  },
  ROCO: {
    chainId: 43114,
    address: '0xb2a85C5ECea99187A977aC34303b80AcbDdFa208',
    decimals: 18,
    name: 'Roco Finance',
    symbol: 'ROCO',
    website: 'https://roco.finance/',
    description:
      'ROCO is a decentralized GAMEFI platform which provide blockchain services to game developers, content creators and player communities through the blockchain network.',
    logoURI: 'https://assets.coingecko.com/coins/images/19234/large/86109466.png?1634769540',
  },
  HON: {
    chainId: 43114,
    address: '0xEd2b42D3C9c6E97e11755BB37df29B6375ede3EB',
    decimals: 18,
    name: 'Heroes of NFT',
    symbol: 'HON',
    website: 'https://heroesofnft.com/',
    description:
      'Heroes of NFT is an online card game where you can attend tournaments and defeat your opponents to rise to victory.',
    logoURI: 'https://assets.coingecko.com/coins/images/23527/small/tokenlogo200.png?1644368289',
  },
  FITFI: {
    chainId: 43114,
    address: '0x714f020C54cc9D104B6F4f6998C63ce2a31D1888',
    decimals: 18,
    name: 'STEP.APP',
    symbol: 'FITFI',
    website: 'https://step.app/',
    description:
      'Step App is creating a gamified metaverse for the fitness economy. Walk, jog, and run to socialize, play, and earn. - Stake to earn portion of ecosystem fees. - Stake includes a cooldown, breaking which causes a penalty. - Tiered stakers acquire discounts on NFT market.',

    logoURI:
      'https://assets.coingecko.com/coins/images/25015/small/801485424e1f49bc8d0facff9287eb9b_photo.png?1649827972',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
