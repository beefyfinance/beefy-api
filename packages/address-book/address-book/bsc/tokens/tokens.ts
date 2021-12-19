import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const BNB = {
  name: 'WBNB Token',
  symbol: 'WBNB',
  address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  chainId: 56,
  decimals: 18,
  website: 'https://www.binance.com/',
  description:
    'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
  logoURI:
    'https://pancakeswap.finance/images/tokens/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
} as const;

const _tokens = {
  CRUSH: {
    name: 'Crush Coin',
    symbol: 'CRUSH',
    address: '0x0Ef0626736c2d484A792508e99949736D0AF807e',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/CRUSH.svg',
    website: 'https://www.bitcrush.com/',
    description:
      'Bitcrush uses a hybrid approach that allows centralized gameplay utilizing a non-custodial live wallet.',
  },
  STATIC: {
    name: 'STATIC',
    symbol: 'STATIC',
    address: '0x7dEb9906BD1d77B410a56E5C23c36340Bd60C983',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://www.chargedefi.fi/static/media/static.180ec003.png',
    website: 'https://www.chargedefi.fi/',
    description: 'Algorithmic Stablecoin ecosystem with rebase mechanics.',
  },
  CHARGE: {
    name: 'CHARGE',
    symbol: 'CHARGE',
    address: '0x1C6bc8e962427dEb4106aE06A7fA2d715687395c',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://www.chargedefi.fi/static/media/charge.53089c19.png',
    website: 'https://www.chargedefi.fi/',
    description: 'Algorithmic Stablecoin ecosystem with rebase mechanics.',
  },
  BISON: {
    name: 'Bison',
    symbol: 'BISON',
    address: '0x19A6Da6e382b85F827088092a3DBe864d9cCba73',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/BISON.svg',
    website: 'https://bishares.finance/',
    description:
      'Gain exposure in an easy and fast way to several crypto assets represented by a single token. Earn passive yield by staking on BiShares farms.',
  },
  NUGGET: {
    name: 'Gold Nugget',
    symbol: 'NUGGET',
    address: '0xE0B58022487131eC9913C1F3AcFD8F74FC6A6C7E',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/NUGGET.svg',
    website: 'https://block-mine.io/',
    description:
      'A revolutionary sustainable Liquidity Mining Solution on Binance Smart Chain (Sustainable Mining, Token Evolution, Wild-West Gaming & Restricted Chain Routing).',
  },
  GOLDCOIN: {
    name: 'Goldcoin',
    symbol: 'GOLDCOIN',
    address: '0xF2f02f60fD1a376270e777Aa2a4667329E3984eD',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/GOLDCOIN.svg',
    website: 'https://block-mine.io/',
    description:
      'A revolutionary sustainable Liquidity Mining Solution on Binance Smart Chain (Sustainable Mining, Token Evolution, Wild-West Gaming & Restricted Chain Routing).',
  },
  FRAX: {
    name: 'Frax Token',
    symbol: 'FRAX',
    address: '0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/FRAX.png',
    website: 'https://frax.finance/',
    description: 'Frax is the world’s first fractional-algorithmic stablecoin.',
  },
  FXS: {
    name: 'Frax Share',
    symbol: 'FXS',
    address: '0xe48A3d7d0Bc88d552f730B62c006bC925eadB9eE',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/FXS.png',
    website: 'https://frax.finance/',
    description:
      'The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
  },
  BETU: {
    name: 'BETU Token',
    symbol: 'BETU',
    address: '0x0df1B3F30865C5b324797F8dB9d339514caC4e94',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x0df1B3F30865C5b324797F8dB9d339514caC4e94/logo.png',
    website: 'https://www.betu.io/',
    description:
      'Sports, esports & crypto betting platform. Secured by smart contracts & powered by the BETU token.',
  },
  OASIS: {
    name: 'OASIS',
    symbol: 'OASIS',
    address: '0xb19289b436b2F7A92891ac391D8f52580d3087e4',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/OASIS.svg',
    website: 'https://projectoasis.io/',
    description:
      'ProjectOasis is a metaverse built for users to socialize and interact with various Dapps and protocols available within DeFi',
  },
  CEEK: {
    name: 'CEEK',
    symbol: 'CEEK',
    address: '0xe0F94Ac5462997D2BC57287Ac3a3aE4C31345D66',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/CEEK.png',
    website: 'https://www.ceek.com/',
    description:
      'CEEK (CEEK) is a decentralized platform featuring global superstars like Lady Gaga, Katy Perry, Ziggy Marley, Bon Jovi, UFC Champion Francis Ngannou, 3x NBA Champion Dwyane Wade and more.',
  },
  BABY: {
    name: 'BabySwap Token',
    symbol: 'BABY',
    address: '0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/babyswap_32.png',
    website: 'https://babyswap.finance',
    description:
      'BabySwap is the best AMM+NFT decentralized exchange for newborn projects on Binance Smart Chain, providing a more friendly trading experience and better project support.',
  },
  NFTY: {
    name: 'NFTY Token',
    symbol: 'NFTY',
    address: '0x5774B2fc3e91aF89f89141EacF76545e74265982',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/NFTY.png',
    website: 'https://nftynetwork.io/',
    description:
      'NFTYLabs envisions a world where NFTs function as a medium of access, bringing a means of utility and privilege to NFT holders in a secure and confidential manner.',
  },
  BETA: {
    name: 'Beta Token',
    symbol: 'BETA',
    address: '0xBe1a001FE942f96Eea22bA08783140B9Dcc09D28',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xBe1a001FE942f96Eea22bA08783140B9Dcc09D28.svg',
    website: 'https://betafinance.org/',
    description:
      'Beta Finance is the permissionless money market for borrowing, lending, and shorting crypto assets.',
  },
  SING: {
    name: 'Sing Token',
    symbol: 'SING',
    address: '0x23894C0ce2d79B79Ea33A4D02e67ae843Ef6e563',
    chainId: 56,
    decimals: 18,
    website: 'https://singular.farm/',
    description:
      'Singular is a multichain, decentralized, strategic yield farm running on Polygon, BSC, Fantom and Okchain. Users are incentivized with a triple farming system.',
    logoURI: 'https://github.com/singularfarm/assets/blob/main/400.png?raw=true',
  },
  ONG: {
    name: 'Ontology Gas Token',
    symbol: 'ONG',
    address: '0x308bfaeAaC8BDab6e9Fc5Ead8EdCb5f95b0599d9',
    chainId: 56,
    decimals: 18,
    website: 'https://ont.io/',
    description:
      'Ontology is a high performance, open source blockchain specializing in digital identity and data.',
    logoURI: 'https://apeswap.finance/images/tokens/ONG.svg',
  },
  PACOCA: {
    name: 'Pacoca',
    symbol: 'PACOCA',
    address: '0x55671114d774ee99D653D6C12460c780a67f1D18',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/pacoca_32.png',
    description: 'Invest in yield-optimizing vaults and track your DeFi assets on BSC',
    website: 'https://pacoca.io/',
  },
  ANN: {
    name: 'Annex',
    symbol: 'ANN',
    address: '0x98936Bde1CF1BFf1e7a8012Cee5e2583851f2067',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://app.annex.finance/images/coins/ANN.png',
    description:
      'A Decentralized Marketplace for Lenders and Borrowers with Borderless Stablecoins.',
    website: 'https://www.annex.finance/',
  },
  CZF: {
    name: 'Chinese Zodiac',
    symbol: 'CZF',
    address: '0x7c1608C004F20c3520f70b924E2BfeF092dA0043',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://github.com/chinese-zodiac/czodiac-site/blob/main/src/images/czodiac-coin.png?raw=true',
    description:
      'Chinese Zodiac is a lending and NFT ecosystem, with a unique NFT Tiger Hunt game.',
    website: 'https://app.czodiac.com/#/',
  },
  LONG: {
    name: 'Longdrink Finance',
    symbol: 'LONG',
    address: '0x5317fA16f8603bE9C461DeF5D5A1Bf28DfE42d55',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://longdrink.finance/static/media/longdrink-logo.0b6c21de.png',
    description:
      "Longdrink Finance creates index tokens on Binance Smart Chain. LONG is the protocol's governance token enabling holders to decide on the composition of future indices and their weightings, as well as fee capturing within the protocol.",
    website: 'https://longdrink.finance/#/',
  },
  PEAR: {
    name: 'PearZap',
    symbol: 'PEAR',
    address: '0xdf7C18ED59EA738070E665Ac3F5c258dcc2FBad8',
    decimals: 18,
    chainId: 56,
    logoURI: 'https://assets.coingecko.com/coins/images/17173/small/pear200.png',
    description: 'High yields farms & pools on the Polygon chain & Binance Smart Chain',
    website: 'https://bsc.pearzap.com/',
  },
  TLOS: {
    name: 'Telos',
    symbol: 'TLOS',
    address: '0xb6C53431608E626AC81a9776ac3e999c5556717c',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xb6C53431608E626AC81a9776ac3e999c5556717c.svg',
    description:
      'Telos is built for speed and scalability making it the ideal network for mainstream adoption – Telos based Tokens NFT’s and Smart Contracts are already used for DeFi, Gaming, Social Media apps and so much more. ',
    website: 'https://www.telos.net/',
  },
  BSCDEFI: {
    name: 'BSC Defi Blue Chips',
    symbol: 'BSCDEFI',
    address: '0x40E46dE174dfB776BB89E04dF1C47d8a66855EB3',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://powerindex.io/images/index-tokens/sdefi.svg',
    description:
      'Build your own exposure to DeFi using bullish, bearish, and hedged investment DAO-managed DeFi products with rewards. More details on powerpool.finance',
    website: 'https://powerindex.io/#/binance/',
  },
  ELK: {
    name: 'Elk Finance',
    symbol: 'ELK',
    address: '0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/200x200/10095.png',
    description:
      'Elk.Finance is a cross-chain liquidity network, allowing for instantaneous exchange of tokens between chains. Elk.Finance also aims to provide the first gyroscopic stablecoin (CHFT) available on multiple chains for blazing fast payments anytime, anywhere.',
    website: 'https://elk.finance/',
  },
  QBT: {
    name: 'Qubit Token',
    symbol: 'QBT',
    address: '0x17B7163cf1Dbd286E262ddc68b553D899B93f526',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x17B7163cf1Dbd286E262ddc68b553D899B93f526.svg',
    website: 'https://qbt.fi/',
    description:
      'Qubit Finance is a DeFi lending protocol developed by MOUND, the team behind Pancake Bunny',
  },
  AURO: {
    name: 'Viralata',
    symbol: 'AURO',
    address: '0x8d9A79314c4e09A7c53C124195cAeB8B89F4879D',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://app.viralata.finance/nextimg/%2Fimages%2Ftokens%2Fauro.png/128/50?url=%2Fimages%2Ftokens%2Fauro.png&w=128&q=50',
    description: 'Viralata Finance',
    website: 'https://app.viralata.finance/',
  },
  NAOS: {
    name: 'NAOS Finance',
    symbol: 'NAOS',
    address: '0x758d08864fB6cCE3062667225ca10b8F00496cc2',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x758d08864fB6cCE3062667225ca10b8F00496cc2.png',
    description: 'DeFi Lending',
    website: 'https://naos.finance/',
  },
  PHA: {
    name: 'Phala Network',
    symbol: 'PHA',
    address: '0x0112e557d400474717056C4e6D40eDD846F38351',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x0112e557d400474717056C4e6D40eDD846F38351.png',
    description: 'Global Confidential Compute Cloud',
    website: 'https://phala.network/en/',
  },
  USDO: {
    name: 'USD Open Dollar',
    symbol: 'USDO',
    address: '0x5801D0e1C7D977D78E4890880B8E579eb4943276',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/14828/small/New_USDO_32px_.png',
    website: 'https://omnifarms.ocp.finance/',
    description:
      'USDO is a decentralised stablecoin backed by a verifiable collateral pool of on-chain assets.',
  },
  FET: {
    name: 'Fetch',
    symbol: 'FET',
    address: '0x031b41e504677879370e9DBcF937283A8691Fa7f',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/5681/small/Fetch.jpg',
    website: 'https://fetch.ai/',
    description: 'Fetch.ai is delivering AI to the crypto economy.',
  },
  YEL: {
    name: 'YEL Token',
    symbol: 'YEL',
    address: '0xD3b71117E6C1558c1553305b44988cd944e97300',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/YEL.svg',
    website: 'https://yel.finance/',
    description:
      'Yield Enhancement Labs core mission is to help projects gain liquidity across multiple chains while building token economics with constant buy-pressure for YEL token',
  },
  rUSD: {
    name: 'Ramp Defi USD',
    symbol: 'rUSD',
    address: '0x07663837218A003e66310a01596af4bf4e44623D',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://www.rampdefi.com/icons/ramp_v4.svg',
    description: 'Ramp Defi USD pegged token',
    website: 'https://www.rampdefi.com/',
  },
  BP: {
    name: 'Bunny Park',
    symbol: 'BP',
    address: '0xACB8f52DC63BB752a51186D1c55868ADbFfEe9C1',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x477bC8d23c634C154061869478bce96BE6045D12/logo.png',
    description: 'NFT & Yield Farm on Binance Smart Chain',
    website: 'https://www.bunnypark.com/',
  },
  SFUND: {
    name: 'Seedify',
    symbol: 'SFUND',
    address: '0x477bC8d23c634C154061869478bce96BE6045D12',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x477bC8d23c634C154061869478bce96BE6045D12/logo.png',
    description: 'Incubator & Launchpad for Blockchain Games & Gamers',
    website: 'https://launchpad.seedify.fund/',
  },
  CAPS: {
    name: 'Capsule Coin',
    symbol: 'CAPS',
    address: '0xFfBa7529AC181c2Ee1844548e6D7061c9A597dF4',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://apeswap.finance/images/tokens/CAPS.svg',
    description: 'NFT-Based Decentralized Data Transmission Blockchain.',
    website: 'https://www.ternoa.com/',
  },
  WUSD: {
    name: 'Wault USD',
    symbol: 'WUSD',
    address: '0x3fF997eAeA488A082fb7Efc8e6B9951990D0c3aB',
    chainId: 56,
    decimals: 18,
    website: 'https://wault.finance/',
    description:
      "WUSD is Wault Finance's commerce-backed stablecoin! The world's first commerce-backed stablecoin!",
    logoURI: 'https://app.wault.finance/bsc/assets/images/stablecoin/wusd.svg',
  },
  CYT: {
    name: 'Coinary Token',
    symbol: 'CYT',
    address: '0xd9025e25Bb6cF39f8c926A704039D2DD51088063',
    chainId: 56,
    decimals: 18,
    website: 'https://dragonary.com/',
    description:
      'CYT is used as the currency for the game Dragonary and throughout the Coinary gaming multiverse.',
    logoURI:
      'https://gblobscdn.gitbook.com/spaces%2F-Mdx-7pkiD2Xoca5jkXV%2Favatar-1626481398232.png?alt=media',
  },
  LAND: {
    name: 'Landshare Token',
    symbol: 'LAND',
    address: '0x9D986A3f147212327Dd658F712d5264a73a1fdB0',
    chainId: 56,
    decimals: 18,
    website: 'https://landshare.io/',
    description:
      'Bringing Real Estate to the Blockchain. Landshare offers a hassle-free alternative to traditional real estate investments.',
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/LAND.svg',
  },
  GUARD: {
    name: 'Guardian',
    symbol: 'GUARD',
    address: '0xF606bd19b1E61574ED625d9ea96C841D4E247A32',
    chainId: 56,
    decimals: 18,
    website: 'https://www.wolfdencrypto.com',
    description:
      'The first decentralized token designed specifically to earn you passive income by unlocking high yield staking and farming opportunities on multiple platforms across the BSC Network',
    logoURI: 'https://apeswap.finance/images/tokens/GUARD.png',
  },
  POTS: {
    name: 'Moonpot',
    symbol: 'POTS',
    address: '0x3Fcca8648651E5b974DD6d3e50F61567779772A8',
    chainId: 56,
    decimals: 18,
    website: 'https://moonpot.com/',
    description: 'The win-win lottery on BSC where every ticket earns you interest.',
    logoURI:
      'https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x3Fcca8648651E5b974DD6d3e50F61567779772A8/logo.png',
  },
  REVV: {
    name: 'REVV',
    symbol: 'REVV',
    address: '0x833F307aC507D47309fD8CDD1F835BeF8D702a93',
    chainId: 56,
    decimals: 18,
    website: 'https://revvmotorsport.com',
    description:
      'The REVV token is an ERC-20 utility token that acts as the main currency for a number of game dApps developed by Animoca Brands.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x833F307aC507D47309fD8CDD1F835BeF8D702a93.svg',
  },
  BMON: {
    name: 'Binamon',
    symbol: 'BMON',
    address: '0x08ba0619b1e7A582E0BCe5BBE9843322C954C340',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x08ba0619b1e7A582E0BCe5BBE9843322C954C340.svg',
    website: 'https://binamon.org/',
    description: 'A complete metaverse of digital monsters inspired by Axie Infinity',
  },
  WSG: {
    name: 'Wall Street Games',
    symbol: 'WSG',
    address: '0xA58950F05FeA2277d2608748412bf9F802eA4901',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xA58950F05FeA2277d2608748412bf9F802eA4901.svg',
    website: 'https://wsg.gg/',
    description:
      'The next generation gaming platform with a unique and immersive way to earn rewards',
  },
  METAHERO: {
    name: 'Metahero',
    symbol: 'HERO',
    address: '0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xD40bEDb44C081D2935eebA6eF5a3c8A31A1bBE13.svg',
    website: 'https://metahero.io/',
    description:
      "Deflationary token with Smart Staking, Burn and Auto Liquidity used to transact in Metahero's ecosystem for real world utility",
  },
  DEP: {
    name: 'DEAPCOIN',
    symbol: 'DEP',
    address: '0xcaF5191fc480F43e4DF80106c7695ECA56E48B18',
    chainId: 56,
    decimals: 18,
    website: 'https://dea.sg/',
    description:
      'DEAPCOIN is a platform that will create a new economy and culture in the PlayMining gaming field where digital assets will be distributed in a new age infrastructure that compensates users by using blockchain.',
    logoURI: 'https://pbs.twimg.com/profile_images/1258627009296531456/qGAevdn7_400x400.png',
  },
  SISTA: {
    name: 'srnArtGallery Tokenized Arts',
    symbol: 'SISTA',
    address: '0xCA6d25C10dad43ae8Be0bc2af4D3CD1114583C08',
    chainId: 56,
    decimals: 18,
    website: 'https://srnartgallery.com/',
    description:
      'srnArtGallery is a platform where a union of artists use NFT art to connect people through the things they love…',
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/SISTA.svg',
  },
  TAPE: {
    name: 'Ape Tooks',
    symbol: 'TAPE',
    address: '0xF63400ee0420ce5b1Ebdee0C942D7dE1C734a41f',
    chainId: 56,
    decimals: 18,
    website: 'https://www.apetools.co/',
    description:
      'A decentralized tool platform that provides trading tools for dexes in the Binance Smart Chain and Polygon network, Besides aiming to release unique tokens for the community through IDO sales',
    logoURI: 'https://bscscan.com/token/images/apetoolsco_32.png',
  },
  STARS: {
    name: 'Mogul Stars',
    symbol: 'STARS',
    address: '0xbD83010eB60F12112908774998F65761cf9f6f9a',
    chainId: 56,
    decimals: 18,
    website: 'https://www.mogulproductions.com/',
    description:
      'Mogul is a decentralized film financing platform that brings creators, fans, and film financiers together; allowing everyone to play a part in the next big blockbuster',
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/STARS.svg',
  },
  SKILL: {
    name: 'CryptoBlades Skill Token',
    symbol: 'SKILL',
    address: '0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab',
    chainId: 56,
    decimals: 18,
    website: 'https://www.cryptoblades.io/',
    description:
      'CryptoBlades is a NFT crafting game where players employ powerful weapons to defeat opponents and collect SKILL tokens, which can be used for upgrades and to level up characters.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x154A9F9cbd3449AD22FDaE23044319D6eF2a1Fab.svg',
  },
  SPS: {
    name: 'Splintershards',
    symbol: 'SPS',
    address: '0x1633b7157e7638C4d6593436111Bf125Ee74703F',
    chainId: 56,
    decimals: 18,
    website: 'https://splinterlands.com/',
    description:
      'Splinterlands is a digital, collectible card game where you build up a collection of cards, which all have various different stats and abilities, and use them to battle other players in skill-based matches.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1633b7157e7638C4d6593436111Bf125Ee74703F.svg',
  },
  AXS: {
    name: 'Axie Infinity Shard',
    symbol: 'AXS',
    address: '0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://bscscan.com/token/images/axieinfinity_32.png',
    website: 'https://axieinfinity.com/',
    description:
      'Axie Infinity is a Pokémon-inspired digital pet universe built on the Ethereum blockchain where anyone can earn token rewards through skilled gameplay and contributions to the ecosystem.',
  },
  OOE: {
    name: 'Open Ocean Finance',
    symbol: 'OOE',
    address: '0x9029FdFAe9A03135846381c7cE16595C3554e10A',
    chainId: 56,
    decimals: 18,
    website: 'https://openocean.finance/',
    description:
      'OpenOcean is the worlds first full aggregation protocol for crypto trading that source liquidity from DeFi and CeFi, and enable cross-chain swaps. Our intelligent routing algorithm find the best prices from DEXes and CEXes, and split the routes to provide traders the best prices with low slippage and fast settlement. The function is free to use, OpenOcean users only need to pay the normal blockchain gas fees and exchange fees for the trades, which are charged by the exchanges and not OpenOcean.',
    logoURI: 'https://ethapi.openocean.finance/asset/icon-ooe.svg?t=2',
  },
  C98: {
    name: 'Coin98',
    symbol: 'C98',
    address: '0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6',
    chainId: 56,
    decimals: 18,
    website: 'https://coin98.com/',
    description:
      'Coin98 enables value transfer as easily as using the Internet by the innovation of Multi-chain Engine, Fully Automatic Liquidity and Space Gate, all in one Super Liquidity Aggregator.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xaEC945e04baF28b135Fa7c640f624f8D90F1C3a6.svg',
  },
  CHESS: {
    name: 'Chess',
    symbol: 'CHESS',
    address: '0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6',
    chainId: 56,
    decimals: 18,
    website: 'https://tranchess.com/',
    description:
      'Tranchess is a tokenized asset management and derivatives trading protocol, which is inspired by tranche funds that cater to different class of investors with varying risk appetites.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x20de22029ab63cf9A7Cf5fEB2b737Ca1eE4c82A6.svg',
  },
  TITAN: {
    name: 'TitanSwap',
    symbol: 'TITAN',
    address: '0xe898EDc43920F357A93083F1d4460437dE6dAeC2',
    chainId: 56,
    decimals: 18,
    website: 'https://titanswap.org/',
    description:
      'TITAN is a blockchain based decentralized financial center that provides optimal liquidity solutions for different digital asset category by adaptive bonding curve. It not only provides a user-centered decentralized exchange, but also it is an aggregated liquidity pool that supports order smart routing.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe898EDc43920F357A93083F1d4460437dE6dAeC2.svg',
  },
  MASK: {
    name: 'Mask Network',
    symbol: 'MASK',
    address: '0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3',
    chainId: 56,
    decimals: 18,
    website: 'https://mask.io/',
    description:
      'Mask Network is a protocol that allows its users to send encrypted messages over Twitter and Facebook. It essentially acts as a bridge between the internet and a decentralized network running on top',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2eD9a5C8C13b93955103B9a7C167B67Ef4d568a3.svg',
  },
  ORBS: {
    name: 'Orbs',
    symbol: 'ORBS',
    address: '0xeBd49b26169e1b52c04cFd19FCf289405dF55F80',
    chainId: 56,
    decimals: 18,
    website: 'https://www.orbs.com/',
    description:
      'The Orbs Network is a public blockchain infrastructure designed for businesses looking at trust as a competitive strategy.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xeBd49b26169e1b52c04cFd19FCf289405dF55F80.svg',
  },
  ADX: {
    name: 'AdEx Network',
    symbol: 'ADX',
    address: '0x6bfF4Fb161347ad7de4A625AE5aa3A1CA7077819',
    chainId: 56,
    decimals: 18,
    website: 'https://www.adex.network/',
    description:
      'ADX is the native utility token that is used for incentivizing validator uptime and ensuring the smooth running of all advertising campaigns on the AdEx platform.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x6bfF4Fb161347ad7de4A625AE5aa3A1CA7077819.svg',
  },
  BSCPAD: {
    name: 'BSCPAD.com',
    symbol: 'BSCPAD',
    address: '0x5A3010d4d8D3B5fB49f8B6E57FB9E48063f16700',
    chainId: 56,
    decimals: 18,
    website: 'https://bscpad.com/',
    description:
      'BSCPAD aims to become the next evolution of blockchain launchpads solving the fundamental flaws that plague existing launchpads. This platform benefits all holders of the token and allows for fair launches giving traders of all sizes the opportunity to invest in the best upcoming Binance Smart Chain projects.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5A3010d4d8D3B5fB49f8B6E57FB9E48063f16700.svg',
  },
  RABBIT: {
    name: 'Rabbit Coin',
    symbol: 'RABBIT',
    address: '0x95a1199EBA84ac5f19546519e287d43D2F0E1b41',
    chainId: 56,
    decimals: 18,
    website: 'https://rabbitfinance.io/',
    description: 'Rabbit Finance is a cross-chain leveraged lending protocol.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x95a1199EBA84ac5f19546519e287d43D2F0E1b41.svg',
  },
  WEX: {
    name: 'WaultSwap',
    symbol: 'WEX',
    address: '0xa9c41A46a6B3531d28d5c32F6633dd2fF05dFB90',
    chainId: 56,
    decimals: 18,
    website: 'https://wault.finance/',
    description:
      'Wault Finance is a decentralized finance hub that connects all of the primary DeFi use-cases within one simple ecosystem, on the Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xa9c41A46a6B3531d28d5c32F6633dd2fF05dFB90.svg',
  },
  WAULTx: {
    name: 'Wault',
    symbol: 'WAULTx',
    address: '0xB64E638E60D154B43f660a6BF8fD8a3b249a6a21',
    chainId: 56,
    decimals: 18,
    website: 'https://wault.finance/',
    description:
      'Wault Finance is a decentralized finance hub that connects all of the primary DeFi use-cases within one simple ecosystem, on the Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xB64E638E60D154B43f660a6BF8fD8a3b249a6a21.svg',
  },
  DG: {
    name: 'Decentralized Game',
    symbol: 'DG',
    address: '0x9Fdc3ae5c814b79dcA2556564047C5e7e5449C19',
    chainId: 56,
    decimals: 18,
    website: 'https://decentral.games/',
    description:
      'Decentral.games is a community-owned metaverse casino ecosystem powered by $DG where players earn $DG for playing games.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x9Fdc3ae5c814b79dcA2556564047C5e7e5449C19.png',
  },
  WOO: {
    name: 'Woo',
    symbol: 'WOO',
    address: '0x4691937a7508860F876c9c0a2a617E7d9E945D4B',
    chainId: 56,
    decimals: 18,
    website: 'https://woo.network/',
    description:
      'Wootrade is a layer one trading infrastructure complete with deep liquidity, frontend trading GUI, and the ability to integrate into any exchange, trading desk, wallet, dApp, or other trading-related platform.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4691937a7508860F876c9c0a2a617E7d9E945D4B.png',
  },
  HAI: {
    name: 'Hai',
    symbol: 'HAI',
    address: '0xaA9E582e5751d703F85912903bacADdFed26484C',
    chainId: 56,
    decimals: 8,
    website: 'https://hackenfoundation.com/',
    description:
      'Hacken Token (HAI) is a cybersecurity coin underlying the rapidly growing Hacken Foundation. Hacken Foundation is a fully fledged organization that unites cybersecurity products and companies developing secure Web 3.0 infrastructure.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xaA9E582e5751d703F85912903bacADdFed26484C.png',
  },
  O3: {
    name: 'O3',
    symbol: 'O3',
    address: '0xEe9801669C6138E84bD50dEB500827b776777d28',
    chainId: 56,
    decimals: 18,
    website: 'https://o3swap.com/',
    description:
      'O3 Swap is a cross-chain aggregation protocol, allowing users to access multi-chain liquidity sources on one platform.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xEe9801669C6138E84bD50dEB500827b776777d28.png',
  },
  TENFI: {
    name: 'TENFI',
    symbol: 'TENFI',
    address: '0xd15C444F1199Ae72795eba15E8C1db44E47abF62',
    chainId: 56,
    decimals: 18,
    website: 'https://ten.finance/',
    description:
      'TEN is a yield aggregator / optimizer that simplifies staking and yield farming with the most liquid Binance Smart Chain Liquidity Pools available and provides a robust yield earning environment on the market while adhering to security, sustainability, longevity and simplicity.',
    logoURI: 'https://bscscan.com/token/images/tenfinance_32.png',
  },
  MBOX: {
    name: 'Mobox',
    symbol: 'MBOX',
    address: '0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377',
    chainId: 56,
    decimals: 18,
    website: 'https://www.mobox.io/',
    description:
      'MOBOX Protocol combines the best of yield farming DeFi with Gaming NFTs creating a truly free to play and play to earn ecosystem.',
    logoURI: 'https://bscscan.com/token/images/mobox_32.png',
  },
  ATA: {
    name: 'Automata',
    symbol: 'ATA',
    address: '0xA2120b9e674d3fC3875f415A7DF52e382F141225',
    chainId: 56,
    decimals: 18,
    website: 'https://www.ata.network/',
    description:
      'Automata Network is a decentralized service protocol that provides privacy middleware for dApps across multiple blockchains.',
    logoURI: 'https://bscscan.com/token/images/automata_32.png',
  },
  SHIB: {
    name: 'SHIBA INU',
    symbol: 'SHIB',
    address: '0x2859e4544C4bB03966803b044A93563Bd2D0DD4D',
    chainId: 56,
    decimals: 18,
    website: 'https://shibatoken.com/',
    description:
      'According to the SHIBA INU website, SHIB is the “DOGECOIN KILLER” and will be listed on their own ShibaSwap, a decentralized exchange.',
    logoURI: 'https://bscscan.com/token/images/shibatoken_32.png',
  },
  CELR: {
    name: 'CelerToken',
    symbol: 'CELR',
    address: '0x1f9f6a696C6Fd109cD3956F45dC709d2b3902163',
    chainId: 56,
    decimals: 18,
    website: 'https://www.celer.network/#',
    description:
      'The Celer Network (CELR) is a smartly designed layer-2 scaling solution that provides off-chain transactions handling.',
    logoURI: 'https://bscscan.com/token/images/celernetwork_32.png',
  },
  WINGS: {
    name: 'JetSwap',
    symbol: 'WINGS',
    address: '0x0487b824c8261462F88940f97053E65bDb498446',
    chainId: 56,
    decimals: 18,
    website: 'https://jetswap.finance/',
    description:
      'Jetswap is a decentralized Automated Market Maker (AMM) on Binance Smart Chain with low fees and instant trade execution.',
    logoURI: 'https://bscscan.com/token/images/jetswap_32.png',
  },
  SDUMP: {
    name: 'Space Dumpling',
    symbol: 'SDUMP',
    address: '0x13F6751ba11337BC67aBBdAd638a56194ee133B8',
    chainId: 56,
    decimals: 18,
    website: 'https://dumplingdefi.finance/',
    description:
      'SpaceDumpling token can be used to play various games and farm rewards by providing liquidity on Pancakeswap.',
    logoURI: 'https://bscscan.com/token/images/dumplingdefi2_32.png',
  },
  SAT: {
    name: 'Satisfi',
    symbol: 'xSAT',
    address: '0x8fda94079913CB921D065Ed9c004Afb43e1f900e',
    chainId: 56,
    decimals: 18,
    website: 'https://www.satis.finance/',
    description:
      'SatisFinance is a brand new DeFi project designed by an experienced development team as the 4th generation deflationary yield farm on Binance Smart Chain.',
    logoURI: 'https://bscscan.com/images/main/empty-token.png',
  },
  TOFY: {
    name: 'Tofy',
    symbol: 'TOFY',
    address: '0xE1F2d89a6c79b4242F300f880e490A70083E9A1c',
    chainId: 56,
    decimals: 18,
    website: 'https://safefarms.marshmallowdefi.com/info',
    description:
      'Toffee is the reference token for SAFEFARM within the MarshMallow ecosystem, it is a digital currency received in exchange when you Pool or Farm your Reflection Tokens.',
    logoURI: 'https://bscscan.com/images/main/empty-token.png',
  },
  TNDR: {
    name: 'Thunder',
    symbol: 'TNDR',
    address: '0x7Cc46141AB1057b1928de5Ad5Ee78Bb37eFC4868',
    chainId: 56,
    decimals: 18,
    website: 'https://thunderswap.finance/',
    description:
      'ThunderSwap is an innovative and reliable, next-generation Decentralized Exchange (AMM) and Yield Farm on the Binance Smart Chain (BSC).',
    logoURI: 'https://bscscan.com/token/images/thunderswap_32.png',
  },
  SWIRL: {
    name: 'Swirl Cash',
    symbol: 'SWIRL',
    address: '0x52d86850bc8207b520340B7E39cDaF22561b9E56',
    chainId: 56,
    decimals: 18,
    website: 'https://swirl.cash/',
    description:
      'Swirl Cash is a aecentralized protocol for private transactions on Binance Smart Chain',
    logoURI: 'https://bscscan.com/token/images/swirlcash_32.png',
  },
  HPS: {
    name: 'Happiness',
    symbol: 'HPS',
    address: '0xeDa21B525Ac789EaB1a08ef2404dd8505FfB973D',
    chainId: 56,
    decimals: 18,
    website: 'https://billionhappiness.finance/',
    description:
      'Billion Happiness is a blockchain community-based project, with the goal of introducing Blockchain to billions of people through simple needs including clothes or wearables.',
    logoURI: 'https://bscscan.com/token/images/happiness_32.png',
  },
  PMP: {
    name: 'Pumpy',
    symbol: 'PMP',
    address: '0x8d4FBB3AC63bf33851dCE80D63613Df1A515BC00',
    chainId: 56,
    decimals: 18,
    website: 'https://pumpy.farm/',
    description:
      'Pumpy is an assets management platform and yield farming aggregator running on Binance Smart Chain',
    logoURI: 'https://bscscan.com/images/main/empty-token.png',
  },
  SLME: {
    name: 'Slime',
    symbol: 'SLME',
    address: '0x4fCfA6cC8914ab455B5b33Df916d90BFe70b6AB1',
    chainId: 56,
    decimals: 18,
    website: 'https://slime.finance/',
    description:
      'Slime Finance is an advanced profit-sharing DeFi protocol aiming to go multi-chain.',
    logoURI: 'https://bscscan.com/images/main/empty-token.png',
  },
  JulD: {
    name: 'JulSwap',
    symbol: 'JulD',
    address: '0x5A41F637C3f7553dBa6dDC2D3cA92641096577ea',
    chainId: 56,
    decimals: 18,
    website: 'https://julswap.com/',
    description: 'JulSwap offers automated, decentralized exchange of BSC-20 tokens.',
    logoURI: 'https://tokens.julswap.com/images/0x5A41F637C3f7553dBa6dDC2D3cA92641096577ea.png',
  },
  SOUP: {
    name: 'Soup',
    symbol: 'SOUP',
    address: '0x94F559aE621F1c810F31a6a620Ad7376776fe09E',
    chainId: 56,
    decimals: 18,
    website: 'https://soups.finance/',
    description:
      'SOUP tokens are designed to be used as a medium of exchange. The built-in stability mechanism in the protocol aims to maintain SOUP peg to 1 Binance (BNB) token in the long run.',
    logoURI: 'https://bscscan.com/token/images/soupfinance_32.png',
  },
  SOUPS: {
    name: 'Soup Share',
    symbol: 'SOUPS',
    address: '0x69F27E70E820197A6e495219D9aC34C8C6dA7EeE',
    chainId: 56,
    decimals: 18,
    website: 'https://soups.finance/',
    description:
      'Soup Shares (SOUPS) is the utility token for Soup protocol. Holders of SOUPS tokens can be locked up to claim a pro-rata share of SOUP tokens accumulated in the Boiler contract.',
    logoURI: 'https://bscscan.com/token/images/soupshare_32.png',
  },
  '1INCH': {
    name: '1INCH',
    symbol: '1INCH',
    address: '0x111111111117dC0aa78b770fA6A738034120C302',
    chainId: 56,
    decimals: 18,
    website: 'https://1inch.io/',
    description:
      '1inch is a decentralized exchange (DEX) aggregator, connecting several DEXes into one platform to allow its users to find the most efficient swapping routes across all platforms.',
    logoURI: 'https://tokens.1inch.exchange/0x111111111117dc0aa78b770fa6a738034120c302.png',
  },
  STEAM: {
    name: 'Steam',
    symbol: 'STEAM',
    address: '0x072e3D0D4f14dd82a16B0a33678c6104e9009ED9',
    chainId: 56,
    decimals: 18,
    website: 'https://www.sponge.finance/',
    description: 'The Steam token is an alt token that will be emitted by burning $SOAK.',
    logoURI: 'https://bscscan.com/token/images/steam_32.png',
  },
  SALT: {
    name: 'Salt',
    symbol: 'SALT',
    address: '0x2849b1aE7E04A3D9Bc288673A92477CF63F28aF4',
    chainId: 56,
    decimals: 18,
    website: 'https://www.saltswap.finance/',
    description: 'SALT is the native token of Saltswap.finance yield aggregator.',
    logoURI: 'https://bscscan.com/token/images/saltswap_32.png',
  },
  RAMEN: {
    name: 'Ramen',
    symbol: 'RAMEN',
    address: '0x4F47A0d15c1E53F3d94c069C7D16977c29F9CB6B',
    chainId: 56,
    decimals: 18,
    website: 'https://ramenswap.finance/',
    description:
      'RamenSwap Finance is a community driven Yield Farming, DeFi Yield Aggregator and DEX Aggregator on Binance Smart Chain.',
    logoURI: 'https://bscscan.com/token/images/ramenswap_32.png',
  },
  BREW: {
    name: 'CafeSwap',
    symbol: 'BREW',
    address: '0x790Be81C3cA0e53974bE2688cDb954732C9862e1',
    chainId: 56,
    decimals: 18,
    website: 'https://cafeswap.finance/',
    description: 'REW is native Binance Smart Chain token on the cafeswap.finance platform.',
    logoURI: 'https://bscscan.com/token/images/cafeswap_32.png',
  },
  MSC: {
    name: 'Monster Slayer Cash',
    symbol: 'MSC',
    address: '0x8C784C49097Dcc637b93232e15810D53871992BF',
    chainId: 56,
    decimals: 18,
    website: 'https://monsterslayer.finance/',
    description:
      'Monster Slayer Cash tokens are designed to be used as a medium of exchange. The built-in stability mechanism in the protocol deterministically expands and contracts the MSC supply to maintain MSC peg to 1 $BUSD token.',
    logoURI: 'https://bscscan.com/token/images/monsterslayer_32.png?=v1',
  },
  BTS: {
    name: 'Bat True Share',
    symbol: 'BTS',
    address: '0xc2e1acef50aE55661855E8dcB72adB182A3cC259',
    chainId: 56,
    decimals: 18,
    website: 'https://boltdollar.finance/',
    description:
      'Bolt Shares, also known as “Bolt True Share” are the governance tokens of the ecosystem. These tokens follow a Seigniorage Shares system that maintains a peg by auctioning coins for shares and shares for coins.',
    logoURI: 'https://bscscan.com/token/images/boltshare_32.png',
  },
  KEBAB: {
    name: 'Kebab',
    symbol: 'KEBAB',
    address: '0x7979F6C54ebA05E18Ded44C4F986F49a5De551c2',
    chainId: 56,
    decimals: 18,
    website: 'https://kebabfinance.com/#/',
    description:
      'Kebab Finance is a DEX (Decentralized Exchange), using AMM (Automated Market Maker) technology.',
    logoURI: 'https://bscscan.com/token/images/kebabfinance_32.png',
  },
  SPG: {
    name: 'Sponge',
    symbol: 'SPG',
    address: '0x3aabCf53A1930A42E18D938C019E83Ebee50a849',
    chainId: 56,
    decimals: 9,
    website: 'https://www.sponge.finance/',
    description: 'Sponge is a high passive yield token that absorbs token from other transactions',
    logoURI: 'https://bscscan.com/token/images/sponge_32.png',
  },
  SOAK: {
    name: 'Soak',
    symbol: 'SOAK',
    address: '0x849233FF1aea15D80EF658B2871664C9Ca994063',
    chainId: 56,
    decimals: 18,
    website: 'https://www.sponge.finance/',
    description: 'The Soak token is the main token that will be emitted by Sponge.finance.',
    logoURI: 'https://bscscan.com/token/images/sponge-soak_32.png',
  },
  MSS: {
    name: 'Monster Slayer Share',
    symbol: 'MSS',
    address: '0xAcABD3f9b8F76fFd2724604185Fa5AFA5dF25aC6',
    chainId: 56,
    decimals: 18,
    website: 'https://monsterslayer.finance/',
    description:
      'Monster Slayer Shares loosely represent the value of the Monster Slayer Cash and trust in its systemic ability to maintain MSC to peg.',
    logoURI: 'https://bscscan.com/token/images/monsterslayer-mss_32.png',
  },
  VAPOR: {
    name: 'VAPOR',
    symbol: 'VAPOR',
    address: '0x86ac8a05Cc4eEd2BEa32D271dE50e2A3d129b6B6',
    chainId: 56,
    decimals: 9,
    website: 'https://www.bliquid.io/',
    description:
      'Vapor is a novel protocol that combines the unique mechanisms of several recently successful DeFi projects.',
    logoURI: 'https://tokens.julswap.com/images/0x5A41F637C3f7553dBa6dDC2D3cA92641096577ea.png',
  },
  BHC: {
    name: 'Billion Happiness',
    symbol: 'BHC',
    address: '0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4',
    chainId: 56,
    decimals: 18,
    website: 'https://billionhappiness.finance/',
    description:
      'Billion Happiness is a blockchain community-based project, with the goal of introducing Blockchain to billions of people through simple needs including clothes or wearables.',
    logoURI: 'https://bscscan.com/token/images/billionhappiness_32.png?v=2',
  },
  GOLD: {
    name: 'NAR Ticket',
    symbol: 'GOLD',
    address: '0x8f4087Cb09E0F378f4278a314C94A636665dE24b',
    chainId: 56,
    decimals: 18,
    website: 'https://narwhalswap.org/#/swap',
    description:
      '$GOLD is the second token introduced by the NAR protocol for this update. You’ll need this token to upgrade your abilities in the near future.',
    logoURI: 'https://bscscan.com/token/images/narwhalswap-gold_32.png',
  },
  KTN: {
    name: 'Kattana',
    symbol: 'KTN',
    address: '0xDAe6c2A48BFAA66b43815c5548b10800919c993E',
    chainId: 56,
    decimals: 18,
    website: 'https://kattana.io/',
    description: 'Kattana is the native token of Kattana.io trading terminal.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xDAe6c2A48BFAA66b43815c5548b10800919c993E.png',
  },
  TUSD: {
    name: 'TrueUSD',
    symbol: 'TUSD',
    address: '0x14016E85a25aeb13065688cAFB43044C2ef86784',
    chainId: 56,
    decimals: 18,
    website: 'https://www.trueusd.com/',
    description:
      'TrueUSD (TUSD) is the first independently-verified digital asset redeemable 1-for-1 for US Dollars.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x14016e85a25aeb13065688cafb43044c2ef86784.png',
  },
  VRT: {
    name: 'VRT',
    symbol: 'VRT',
    address: '0x5F84ce30DC3cF7909101C69086c50De191895883',
    chainId: 56,
    decimals: 18,
    website: 'https://venus.io/',
    description:
      'Venus Reward Token is a mechanism created to become an additional mining distribution to suppliers and borrowers of Venus Protocol.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5f84ce30dc3cf7909101c69086c50de191895883.png',
  },
  pOPEN: {
    name: 'pOPEN',
    symbol: 'pOPEN',
    address: '0xaBaE871B7E3b67aEeC6B46AE9FE1A91660AadAC5',
    chainId: 56,
    decimals: 18,
    website: 'https://opendao.io/',
    description: 'The OPEN project is a toolkit to connect the real world to DEFI',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xaBaE871B7E3b67aEeC6B46AE9FE1A91660AadAC5.png',
  },
  WELL: {
    name: 'BitWell',
    symbol: 'WELL',
    address: '0xf07a32Eb035b786898c00bB1C64d8c6F8E7a46D5',
    chainId: 56,
    decimals: 18,
    website: 'https://www.bitwellex.com/',
    description: 'WELL is the native token of the BitWell exchange.',
    logoURI: 'https://bscscan.com/token/images/bitwellex_32.png',
  },
  SNX: {
    name: 'Synthetix',
    symbol: 'SNX',
    address: '0x9Ac983826058b8a9C7Aa1C9171441191232E8404',
    chainId: 56,
    decimals: 18,
    website: 'https://www.synthetix.io/',
    description:
      'Synthetix is the backbone for derivatives trading in DeFi, allowing anyone, anywhere to gain on-chain exposure to a vast range of assets',
    logoURI: 'https://bscscan.com/token/images/snx_32.png',
  },
  BLZ: {
    name: 'Bluezelle',
    symbol: 'BLZ',
    address: '0x935a544Bf5816E3A7C13DB2EFe3009Ffda0aCdA2',
    chainId: 56,
    decimals: 18,
    website: 'https://bluzelle.com/',
    description: 'Bluzelle is a decentralized storage network for the creator economy.',
    logoURI: 'https://dex.apeswap.finance/images/coins/blz.svg',
  },
  DERI: {
    name: 'Deri',
    symbol: 'DERI',
    address: '0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5',
    chainId: 56,
    decimals: 18,
    website: 'https://deri.finance/',
    description:
      'DERI Protocol is a decentralized protocol to exchange risk exposures precisely and capital-efficiently.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe60eaf5A997DFAe83739e035b005A33AfdCc6df5.png',
  },
  CHR: {
    name: 'Chromia',
    symbol: 'CHR',
    address: '0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE',
    chainId: 56,
    decimals: 6,
    website: 'https://chromia.com/',
    description:
      'Chromia is a blockchain platform, making it easy for people to build decentralized apps in the real world, for a better world',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf9CeC8d50f6c8ad3Fb6dcCEC577e05aA32B224FE.png',
  },
  XEND: {
    name: 'XEND',
    symbol: 'XEND',
    address: '0x4a080377f83D669D7bB83B3184a8A5E61B500608',
    chainId: 56,
    decimals: 18,
    website: 'https://anyswap.exchange/',
    description:
      'Xend Finance is a blockchain-based platform inspired by traditional credit unions. It aims to provide opportunities for those interested in borrowing, investing, saving or lending digital assets.',
    logoURI: 'https://bscscan.com/token/images/xendfinance_32.png',
  },
  CYC: {
    name: 'Cyclone Protocol',
    symbol: 'CYC',
    address: '0x810EE35443639348aDbbC467b33310d2AB43c168',
    chainId: 56,
    decimals: 18,
    website: 'https://cyclone.xyz/',
    description:
      'Cyclone is the world first cross-chain, yield enhancement, zkSNARKs-based privacy protocol for all DeFi apps, with the decentralized governance and fair launch.',
    logoURI: 'https://bscscan.com/token/images/cyclone_32.png',
  },
  ZEC: {
    name: 'Z-Cash',
    symbol: 'ZEC',
    address: '0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb',
    chainId: 56,
    decimals: 18,
    website: 'https://z.cash/',
    description: 'Zcash is a digital currency - fast and confidential with low fees.',
    logoURI: 'https://dex.apeswap.finance/images/coins/ZEC.svg',
  },
  ETC: {
    name: 'Ethereum Classic',
    symbol: 'ETC',
    address: '0x3d6545b08693daE087E957cb1180ee38B9e3c25E',
    chainId: 56,
    decimals: 18,
    website: 'https://ethereumclassic.org/',
    description:
      'Ethereum Classic is a decentralized computing platform that executes smart contracts. Applications are ran exactly as programmed without the possibility of censorship, downtime, or third-party interference.',
    logoURI: 'https://dex.apeswap.finance/images/coins/ETC.svg',
  },
  COTI: {
    name: 'Coti',
    symbol: 'COTI',
    address: '0xAdBAF88B39D37Dc68775eD1541F1bf83A5A45feB',
    chainId: 56,
    decimals: 18,
    website: 'https://coti.io/',
    description:
      'COTI is the first enterprise-grade fintech platform that empowers organizations to build their own payment solution and digitize any currency to save time and money.',
    logoURI: 'https://dex.apeswap.finance/images/coins/coti.svg',
  },
  NEAR: {
    name: 'Near',
    symbol: 'NEAR',
    address: '0x1Fa4a73a3F0133f0025378af00236f3aBDEE5D63',
    chainId: 56,
    decimals: 18,
    website: 'https://near.org/',
    description:
      'NEAR is an open source platform that enables creators, communities, and markets to drive a more open, interconnected and consumer-empowered world.',
    logoURI: 'https://dex.apeswap.finance/images/coins/near.svg',
  },
  SWAMP: {
    name: 'Swampy Token',
    symbol: 'SWAMP',
    address: '0xc5A49b4CBe004b6FD55B30Ba1dE6AC360FF9765d',
    chainId: 56,
    decimals: 18,
    website: 'https://swamp.finance/',
    description:
      'Swampy is the native token of Swamp.finance, a yield farming optimiser on Binance Smart Chain.',
    logoURI: 'https://bscscan.com/token/images/swampfinance_32.png',
  },
  HOTCROSS: {
    name: 'Hot Cross Token',
    address: '0x4FA7163E153419E0E1064e418dd7A99314Ed27b6',
    symbol: 'HOTCROSS',
    decimals: 18,
    chainId: 56,
    website: 'https://hotcross.com/',
    description:
      'Hot Cross will become an extensive multi-chain and cross-chain tool suite that enables blockchain teams and their communities to thrive.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4fa7163e153419e0e1064e418dd7a99314ed27b6.png',
  },
  RFOX: {
    name: 'RFOX Token',
    address: '0x0a3A21356793B49154Fd3BbE91CBc2A16c0457f5',
    symbol: 'RFOX',
    decimals: 18,
    chainId: 56,
    website: 'https://www.redfoxlabs.io/',
    description:
      'RedFOX Labs is a tech-forward digital venture builder delivering companies & platforms that are secure, scalable, and innovative, bringing the world into a new era of technology and prosperity.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0a3a21356793b49154fd3bbe91cbc2a16c0457f5.png',
  },
  FINE: {
    name: 'Refinable Token',
    symbol: 'FINE',
    address: '0x4e6415a5727ea08aAE4580057187923aeC331227',
    chainId: 56,
    decimals: 18,
    website: 'https://app.refinable.com/',
    description: 'Refinable is the first dedicated NFT marketplace built on Binance Smart Chain.',
    logoURI: 'https://bscscan.com/token/images/refinable_32.png',
  },
  tDOGE: {
    name: '╧äDogecoin Token',
    symbol: 'tDOGE',
    address: '0xe550a593d09FBC8DCD557b5C88Cea6946A8b404A',
    chainId: 56,
    decimals: 8,
    website: 'https://www.btcst.finance/',
    description:
      'τDoge is the second synthetic asset that BTCST stakers can mine. The price of τDoge is pegged 1:1 to that of Dogecoin in accordance with the price pegging mechanism of the Tau Protocol',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe550a593d09fbc8dcd557b5c88cea6946a8b404a.png',
  },
  OIN: {
    name: 'oinfinance Token',
    symbol: 'OIN',
    address: '0x658E64FFcF40D240A43D52CA9342140316Ae44fA',
    chainId: 56,
    decimals: 8,
    website: 'https://oin.finance/',
    description:
      'OIN brings great DeFi functionality, such as stablecoin issuance to blockchain projects through a multi-faceted infrastructure.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x658E64FFcF40D240A43D52CA9342140316Ae44fA.png',
  },
  PMON: {
    name: 'Polkamon Token',
    symbol: 'PMON',
    address: '0x1796ae0b0fa4862485106a0de9b654eFE301D0b2',
    chainId: 56,
    decimals: 18,
    website: 'https://polychainmonsters.com/',
    description:
      'Polychain Monsters are beautifully animated digital collectibles with varying scarcities. Each Polychain Monster is backed by a truly unique NFT and can be unpacked with $PMON tokens.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1796ae0b0fa4862485106a0de9b654eFE301D0b2.png',
  },
  BTR: {
    name: 'Bitrue Token',
    symbol: 'BTR',
    address: '0x5a16E8cE8cA316407c6E6307095dc9540a8D62B3',
    chainId: 56,
    decimals: 18,
    website: 'http://www.bitrue.com/',
    description: 'BTR is the native token of the BiTrue exchange.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5a16E8cE8cA316407c6E6307095dc9540a8D62B3.png',
  },
  UBXT: {
    name: 'UpBots Token',
    symbol: 'UBXT',
    address: '0xBbEB90cFb6FAFa1F69AA130B7341089AbeEF5811',
    chainId: 56,
    decimals: 18,
    website: 'https://upbots.com/',
    description:
      'UpBots is an all-in-one platform that brings together the best crypto trading tools and strategies that are generally stand-alone services.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbbeb90cfb6fafa1f69aa130b7341089abeef5811.png',
  },
  WMASS: {
    name: 'Wrapped MASS Token',
    symbol: 'WMASS',
    address: '0x7e396BfC8a2f84748701167c2d622F041A1D7a17',
    chainId: 56,
    decimals: 8,
    website: 'https://massnet.org/',
    description:
      'The MASS consensus engine aims to become the basic infrastructure to all blockchain consensus layers.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7e396bfc8a2f84748701167c2d622f041a1d7a17.png',
  },
  ZEFI: {
    name: 'ZCore Finance Token',
    symbol: 'ZEFI',
    address: '0x0288D3E353fE2299F11eA2c2e1696b4A648eCC07',
    chainId: 56,
    decimals: 18,
    website: 'https://finance.zcore.network/',
    description:
      'ZCore is a Binance Smart Chain yield farming bundled with an advanced crypto card with integrated burning mechanism.',
    logoURI: 'https://bscscan.com/token/images/zcore-zefi_32.png',
  },
  ICA: {
    name: 'ICA Token',
    symbol: 'ICA',
    address: '0x95111f630aC215Eb74599ED42C67E2c2790d69e2',
    chainId: 56,
    decimals: 18,
    website: 'https://icarus.finance/',
    description:
      'ICA is the Governance token of icarus.finance and will be used to provide holders voting rights in the next direction of the project. This includes voting on what cryptocurrency to actually mine.',
    logoURI: 'https://bscscan.com/token/images/icarus_32.png',
  },
  STEEL: {
    name: 'IRON Share V2 Token',
    symbol: 'STEEL',
    address: '0x9001eE054F1692feF3A48330cB543b6FEc6287eb',
    chainId: 56,
    decimals: 18,
    website: 'https://iron.finance/',
    description:
      'STEEL - Iron Share - is the algorithmic token which accrues seigniorage revenue and excess collateral value.',
    logoURI: 'https://bscscan.com/token/images/ironfinance-share_32.png',
  },
  TYPH: {
    name: 'Typhoon Token',
    symbol: 'TYPH',
    address: '0x4090e535F2e251F5F88518998B18b54d26B3b07c',
    chainId: 56,
    decimals: 18,
    website: 'https://typhoon.network/',
    description:
      'Typhoon enables you to send private transactions between 2 BSC or Polygon wallets',
    logoURI: 'https://bscscan.com/token/images/typhoonnetwork_32.png',
  },
  IRON: {
    name: 'IRON Stablecoin Token',
    symbol: 'IRON',
    address: '0x7b65B489fE53fCE1F6548Db886C08aD73111DDd8',
    chainId: 56,
    decimals: 18,
    website: 'https://iron.finance/',
    description: 'IRON is the stablecoin token of the iron.finance protocol.',
    logoURI: 'https://bscscan.com/token/images/ironfinance_32.png?=v1',
  },
  KEYFI: {
    name: 'KeyFi Token',
    symbol: 'KEYFI',
    address: '0x4b6000F9163de2E3f0a01eC37E06e1469DBbcE9d',
    chainId: 56,
    decimals: 18,
    website: 'https://keyfi.com/',
    description:
      'KeyFi is an all-in-one platform for tracking, swapping, and staking your tokens, and more.',
    logoURI: 'https://dex.apeswap.finance/images/coins/XBTC.svg',
  },
  NAUT: {
    name: 'Astronaut Token',
    symbol: 'NAUT',
    address: '0x05B339B0A346bF01f851ddE47a5d485c34FE220c',
    chainId: 56,
    decimals: 8,
    website: 'https://astronaut.to/',
    description:
      'Astronaut enables projects to raise capital on a decentralized, permission-less and interoperable environment based on the Binance smart chain.',
    logoURI: 'https://dex.apeswap.finance/images/coins/NAUT.png',
  },
  IOTA: {
    name: 'MIOTAC Token',
    symbol: 'IOTA',
    address: '0xd944f1D1e9d5f9Bb90b62f9D45e447D989580782',
    chainId: 56,
    decimals: 6,
    website: 'https://www.iota.org/',
    description:
      'IOTA has fundamentally reengineered distributed ledger technology, enabling secure exchange of both value and data, without any fees.',
    logoURI: 'https://dex.apeswap.finance/images/coins/IOTA.png',
  },
  AVAX: {
    name: 'Avalanche Token',
    symbol: 'AVAX',
    address: '0x1CE0c2827e2eF14D5C4f29a091d735A204794041',
    chainId: 56,
    decimals: 18,
    website: 'https://www.avalabs.org/',
    description:
      'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
    logoURI: 'https://dex.apeswap.finance/images/coins/avax.png',
  },
  BANANA: {
    name: 'ApeSwapFinance Banana',
    symbol: 'BANANA',
    address: '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95',
    chainId: 56,
    decimals: 18,
    website: 'https://apeswap.finance/',
    description: 'BANANA is the native token of the Apeswap.finance.',
    logoURI:
      'https://raw.githubusercontent.com/ApeSwapFinance/apeswap-token-lists/main/assets/BANANA.svg',
  },
  FTM: {
    name: 'Fantom',
    symbol: 'FTM',
    address: '0xAD29AbB318791D579433D831ed122aFeAf29dcfe',
    chainId: 56,
    decimals: 18,
    website: 'https://fantom.foundation/',
    description:
      'Fantom is a fast, high-throughput open-source smart contract platform for digital assets and dApps.',
    logoURI: 'https://dex.apeswap.finance/images/coins/FTM.svg',
  },
  AAVE: {
    name: 'Binance-Peg Aave Token',
    symbol: 'AAVE',
    address: '0xfb6115445Bff7b52FeB98650C87f44907E58f802',
    chainId: 56,
    decimals: 18,
    website: 'https://aave.com/',
    description:
      'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
    logoURI: 'https://dex.apeswap.finance/images/coins/AAVE.svg',
  },
  MATIC: {
    name: 'Matic Token',
    symbol: 'MATIC',
    address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
    chainId: 56,
    decimals: 18,
    website: 'https://polygon.technology/',
    description:
      'The MATIC token serves dual purposes: securing the Polygon network via staking and being used for the payment of transaction fees.',
    logoURI: 'https://dex.apeswap.finance/images/coins/MATIC.svg',
  },
  DOGE: {
    name: 'Binance-Peg Dogecoin',
    symbol: 'DOGE',
    address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    chainId: 56,
    decimals: 8,
    website: 'https://dogecoin.com/',
    description:
      'Dogecoin is an open source peer-to-peer digital currency, favored by Shiba Inus worldwide.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xba2ae424d960c26247dd6c32edc70b295c744c43.png',
  },
  XED: {
    name: 'Exeedme TOKEN',
    symbol: 'XED',
    address: '0x5621b5A3f4a8008c4CCDd1b942B121c8B1944F1f',
    chainId: 56,
    decimals: 18,
    website: 'https://www.exeedme.com/',
    description:
      'Exeedme is about using blockchain to allow for skill monetization through digital currencies and assets with open market dynamics, giving gamers a superior sense of ownership and control.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5621b5a3f4a8008c4ccdd1b942b121c8b1944f1f.png',
  },
  DFD: {
    name: 'DefiDollar DAO TOKEN',
    symbol: 'DFD',
    address: '0x9899a98b222fCb2f3dbee7dF45d943093a4ff9ff',
    chainId: 56,
    decimals: 18,
    website: 'https://app.dusd.finance/',
    description:
      'DefiDollar is a multi-chain DeFi Protocol Lab. We are building a range of products for the open finance ecosystem including - indexes, yield diversification and enabling capital efficient loans.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x9899a98b222fcb2f3dbee7df45d943093a4ff9ff.png',
  },
  LMT: {
    name: 'Lympo Market TOKEN',
    symbol: 'LMT',
    address: '0x9617857E191354dbEA0b714d78Bc59e57C411087',
    chainId: 56,
    decimals: 18,
    website: 'https://nft.lympo.io/',
    description:
      'The LMT token is a fungible cryptographic token initially released on the Ethereum blockchain and later bridged to Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x9617857e191354dbea0b714d78bc59e57c411087.png',
  },
  SUTER: {
    name: 'Suterusu TOKEN',
    symbol: 'SUTER',
    address: '0x4CfbBdfBd5BF0814472fF35C72717Bd095ADa055',
    chainId: 56,
    decimals: 18,
    website: 'https://suterusu.io/',
    description:
      'The Suterusu Protocol is a second-layer private payment infrastructure for smart contract platforms. The Suterusu Protocol uses the original and most advanced ZK-ConSnark algorithm that does not require a trusted setup.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4cfbbdfbd5bf0814472ff35c72717bd095ada055.png',
  },
  GOAL: {
    name: 'Goal TOKEN',
    symbol: 'GOAL',
    address: '0xE5b57E6e1b945B91FEE368aC108d2ebCcA78Aa8F',
    chainId: 56,
    decimals: 18,
    website: 'https://fanaticsfinance.com/',
    description: 'GOAL is the native token of the fanaticsfinance.com yield aggregator.',
    logoURI: '',
  },
  SPACE: {
    name: 'farm.space TOKEN',
    symbol: 'SPACE',
    address: '0x0abd3E3502c15ec252f90F64341cbA74a24fba06',
    chainId: 56,
    decimals: 18,
    website: 'https://farm.space/',
    description: 'SPACE is the native token of the farm.space yield aggregator.',
    logoURI: '',
  },
  WIN: {
    name: 'WINk Token',
    symbol: 'WIN',
    address: '0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99',
    chainId: 56,
    decimals: 18,
    website: 'https://www.wink.org/',
    description:
      'WINkLink fully integrates the real world with the blockchain space, will be able to provide reliable, unpredictable and verifiable random numbers, and fully restore trust and improve user experience by tapping into data, events, and payment systems.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xaef0d72a118ce24fee3cd1d43d383897d05b4e99.png',
  },
  TRX: {
    name: 'TRON Token',
    symbol: 'TRX',
    address: '0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B',
    chainId: 56,
    decimals: 18,
    website: 'https://tron.network/',
    description:
      'TRON is a blockchain-based operating system that aims to ensure this technology is suitable for daily use.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b.png',
  },
  BTT: {
    name: 'BitTorrent Token',
    symbol: 'BTT',
    address: '0x8595F9dA7b868b1822194fAEd312235E43007b49',
    chainId: 56,
    decimals: 18,
    website: 'https://www.bittorrent.com/',
    description:
      'BitTorrent is a popular peer-to-peer (P2P) file sharing and torrent platform which has become increasingly decentralized in recent years.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8595f9da7b868b1822194faed312235e43007b49.png',
  },
  mCOIN: {
    name: 'Wrapped Mirror COIN Token',
    symbol: 'mCOIN',
    address: '0x49022089e78a8D46Ec87A3AF86a1Db6c189aFA6f',
    chainId: 56,
    decimals: 18,
    website: 'https://mirror.finance/',
    description:
      'Mirrored COIN (mCOIN) is a synthetic asset tracking the price of a Coinbase stock.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x49022089e78a8d46ec87a3af86a1db6c189afa6f.png',
  },
  MDX: {
    name: 'MDEX Token',
    symbol: 'MDX',
    address: '0x9C65AB58d8d978DB963e63f2bfB7121627e3a739',
    chainId: 56,
    decimals: 18,
    website: 'https://bsc.mdex.com/',
    description:
      'MDEX is a new decentralized trading protocol that launched in January 2021. MDEX is an automated market making (AMM) decentralized exchange protocol that operates on the concept of fund pools, sharing some similarities with standard DEXs.',
    logoURI: 'https://mdex.com/token-icons/bsc/0x9c65ab58d8d978db963e63f2bfb7121627e3a739.png',
  },
  xBLZD: {
    name: 'xBLZD Token',
    symbol: 'xBLZD',
    address: '0x9a946c3Cb16c08334b69aE249690C236Ebd5583E',
    chainId: 56,
    decimals: 18,
    website: 'https://www.blizzard.money/',
    description: 'xBLZD is the native token of Blizzard.money where users can yield their tokens.',
    logoURI: 'https://app.beefy.finance/static/media/BLZD.fdf1fc8d.png',
  },
  BNB,
  WBNB: BNB,
  WNATIVE: BNB,
  BAKE: {
    name: 'Bakery Token',
    symbol: 'BAKE',
    address: '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5',
    chainId: 56,
    decimals: 18,
    website: 'https://www.bakeryswap.org/',
    description:
      'BakerySwap is a decentralized automated market-making (AMM) protocol that is based on the Binance Smart Chain (BSC). The BAKE token is a native BEP-20 governance token on the platform.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe02df9e3e622debdd69fb838bb799e3f168902c5.png',
  },
  BUSD: {
    name: 'BUSD Token',
    symbol: 'BUSD',
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    chainId: 56,
    decimals: 18,
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos), Approved and regulated by the New York State Department of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from the official website.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe9e7cea3dedca5984780bafc599bd69add087d56.png',
  },
  ETH: {
    name: 'Ethereum Token',
    symbol: 'ETH',
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    chainId: 56,
    decimals: 18,
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
  },
  BTCB: {
    name: 'BTCB Token',
    symbol: 'BTCB',
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    chainId: 56,
    decimals: 18,
    website: 'https://bitcoin.org/en/',
    description:
      'Bitcoin BEP2 (BTCB) is a token on the Binance Chain. Each BTCB is 100% backed by a BTC reserve, with the price pegged to Bitcoin at a rate of 1 BTCB = 1 BTC.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c.png',
  },
  BAND: {
    name: 'BAND Protocol Token',
    symbol: 'BAND',
    address: '0xAD6cAEb32CD2c308980a548bD0Bc5AA4306c6c18',
    chainId: 56,
    decimals: 18,
    website: 'https://bandprotocol.com/',
    description:
      'Band Protocol is a cross-chain data oracle platform that aggregates and connects real-world data and APIs to smart contracts.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xad6caeb32cd2c308980a548bd0bc5aa4306c6c18.png',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x55d398326f99059fF775485246999027B3197955',
    chainId: 56,
    decimals: 18,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x55d398326f99059ff775485246999027b3197955.png',
  },
  XRP: {
    name: 'XRP Token',
    symbol: 'XRP',
    address: '0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE',
    chainId: 56,
    decimals: 18,
    website: 'https://ripple.com/xrp/',
    description:
      'XRP Ledger (XRPL) is the open-source distributed ledger that is created by Ripple. The native cryptocurrency of the XRP Ledger is XRP.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe.png',
  },
  BCH: {
    name: 'Bitcoin Cash Token',
    symbol: 'BCH',
    address: '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf',
    chainId: 56,
    decimals: 18,
    website: 'https://bitcoincash.org/',
    description:
      'Bitcoin Cash brings sound money to the world, fulfilling the original promise of Bitcoin as "Peer-to-Peer Electronic Cash".',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8ff795a6f4d97e7887c79bea79aba5cc76444adf.png',
  },
  LTC: {
    name: 'Litecoin Token',
    symbol: 'LTC',
    address: '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94',
    chainId: 56,
    decimals: 18,
    website: 'https://litecoin.org/',
    description:
      'Litecoin is a peer-to-peer cryptocurrency and open-source software project released under the MIT/X11 license. Litecoin was an early bitcoin spinoff or altcoin, starting in October 2011.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4338665cbb7b2485a8855a139b75d5e34ab0db94.png',
  },
  ADA: {
    name: 'Cardano Token',
    symbol: 'ADA',
    address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
    chainId: 56,
    decimals: 18,
    website: 'https://cardano.org/',
    description:
      'Within the Cardano platform, Ada exists on the settlement layer.Cardano is a public blockchain platform. It is open-source and decentralized, with consensus achieved using proof of stake.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x3ee2200efb3400fabb9aacf31297cbdd1d435d47.png',
  },
  ATOM: {
    name: 'Cosmos Token',
    symbol: 'ATOM',
    address: '0x0Eb3a705fc54725037CC9e008bDede697f62F335',
    chainId: 56,
    decimals: 18,
    website: 'https://cosmos.network/',
    description:
      'Cosmos is an ever-expanding ecosystem of interconnected apps and services, built for a decentralized future.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0eb3a705fc54725037cc9e008bdede697f62f335.png',
  },
  XTZ: {
    name: 'Tezos Token',
    symbol: 'XTZ',
    address: '0x16939ef78684453bfDFb47825F8a5F714f12623a',
    chainId: 56,
    decimals: 18,
    website: 'https://tezos.com/',
    description:
      'Tezos is an open-source platform that addresses key barriers facing blockchain adoption for assets and applications backed by a global community of validators, researchers, and builders.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x16939ef78684453bfdfb47825f8a5f714f12623a.png',
  },
  ONT: {
    name: 'Ontology Token',
    symbol: 'ONT',
    address: '0xFd7B3A77848f1C2D67E05E54d78d174a0C850335',
    chainId: 56,
    decimals: 18,
    website: 'https://ont.io/',
    description:
      'Ontology is a high performance, open source blockchain specializing in digital identity and data.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xfd7b3a77848f1c2d67e05e54d78d174a0c850335.png',
  },
  DAI: {
    name: 'Dai Token',
    symbol: 'DAI',
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    chainId: 56,
    decimals: 18,
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3.png',
  },
  YFII: {
    name: 'YFII.finance Token',
    symbol: 'YFII',
    address: '0x7F70642d88cf1C4a3a7abb072B53B929b653edA5',
    chainId: 56,
    decimals: 18,
    website: 'https://dfi.money/',
    description:
      'DFI.money is a DeFi-farming aggregator that automatically puts your crypto assets to work for high yield profits.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7f70642d88cf1c4a3a7abb072b53b929b653eda5.png',
  },
  CREAM: {
    name: 'Cream',
    symbol: 'CREAM',
    address: '0xd4CB328A82bDf5f03eB737f37Fa6B370aef3e888',
    chainId: 56,
    decimals: 18,
    website: 'https://cream.finance/',
    description:
      'C.R.E.A.M Finance is a decentralized peer-to-peer (P2P) DeFi platform that provides lending, borrowing, swap, payment and tokenization services for digital assets.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xd4cb328a82bdf5f03eb737f37fa6b370aef3e888.png',
  },
  PROM: {
    name: 'Prometeus',
    symbol: 'PROM',
    address: '0xaF53d56ff99f1322515E54FdDE93FF8b3b7DAFd5',
    chainId: 56,
    decimals: 18,
    website: 'https://prometeus.io/',
    description:
      'Prometeus Network describes itself as a secure and decentralized ecosystem designed to solve real-world problems in data brokerage.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xaf53d56ff99f1322515e54fdde93ff8b3b7dafd5.png',
  },
  CAN: {
    name: 'CanYaCoin',
    symbol: 'CAN',
    address: '0x007EA5C0Ea75a8DF45D288a4debdD5bb633F9e56',
    chainId: 56,
    decimals: 18,
    website: 'https://www.canwork.io/',
    description:
      'CanYaCoin or CAN is the native token that powers the CanWork payment system and will be the bridge between all Binance Chain (BEP2) assets',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x007ea5c0ea75a8df45d288a4debdd5bb633f9e56.png',
  },
  DOT: {
    name: 'Polkadot Token',
    symbol: 'DOT',
    address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
    chainId: 56,
    decimals: 18,
    website: 'https://polkadot.network/',
    description:
      'Polkadot is an open-source sharding multichain protocol that facilitates the cross-chain transfer of any data or asset types, not just tokens, thereby making a wide range of blockchains interoperable with each other.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7083609fce4d1d8dc0c979aab8c869ea2c873402.png',
  },
  CAKE: {
    name: 'PancakeSwap Token',
    symbol: 'CAKE',
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    chainId: 56,
    decimals: 18,
    website: 'https://pancakeswap.finance/',
    description:
      'PancakeSwap is an automated market maker (AMM) — a decentralized finance (DeFi) application that allows users to exchange tokens, providing liquidity via farming and earning fees in return.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82.png',
  },
  STM: {
    name: 'Streamity',
    symbol: 'STM',
    address: '0x90DF11a8ccE420675e73922419e3f4f3Fe13CCCb',
    chainId: 56,
    decimals: 18,
    website: 'https://streamity.org/',
    description:
      'Streamity describes itself as an ecosystem that unites several crypto products (e.g.wallet, exchange, educational courses).',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x90df11a8cce420675e73922419e3f4f3fe13cccb.png',
  },
  ANKR: {
    name: 'Ankr',
    symbol: 'ANKR',
    address: '0xf307910A4c7bbc79691fD374889b36d8531B08e3',
    chainId: 56,
    decimals: 18,
    website: 'https://www.ankr.com/',
    description:
      'Ankr originates as a solution that utilizes shared resources in order to provide easy and affordable blockchain node hosting solutions.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf307910a4c7bbc79691fd374889b36d8531b08e3.png',
  },
  LINK: {
    name: 'ChainLink Token',
    symbol: 'LINK',
    address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD',
    chainId: 56,
    decimals: 18,
    website: 'https://chain.link/',
    description:
      'Link is the currency used to pay the Chainlink node operators for their work. Chainlink node operators have to stake LINK in the network in order to participate and provide data services.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd.png',
  },
  DICE: {
    name: 'Dice.finance Token',
    symbol: 'DICE',
    address: '0x748AD98b14C814B28812eB42ad219C8672909879',
    chainId: 56,
    decimals: 18,
    website: 'https://dice.finance/',
    description: 'DICE.FINANCE is a fully decentralized protocol for a casino on Ethereum.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x748ad98b14c814b28812eb42ad219c8672909879.png',
  },
  'JNTR/b': {
    name: 'JNTR/b',
    symbol: 'JNTR/b',
    address: '0x3c037C4c2296f280bB318D725D0b454B76c199b9',
    chainId: 56,
    decimals: 18,
    website: 'https://jointer.io/',
    description:
      'Jointer strives to simplify the commercial real estate industry so that every investor, even one with zero knowledge or experience, will have the opportunity to syndicate funds and invest in this historically lucrative asset class.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x3c037c4c2296f280bb318d725d0b454b76c199b9.png',
  },
  SPART: {
    name: 'SPARTAN PROTOCOL TOKEN',
    symbol: 'SPART',
    address: '0xE4Ae305ebE1AbE663f261Bc00534067C80ad677C',
    chainId: 56,
    decimals: 18,
    website: 'https://spartanprotocol.org/',
    description:
      'Spartan Protocol provides community-governed and programmable token emissions functions to incentivize the formation of deep liquidity pools.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe4ae305ebe1abe663f261bc00534067c80ad677c.png',
  },
  TWT: {
    name: 'Trust Wallet',
    symbol: 'TWT',
    address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
    chainId: 56,
    decimals: 18,
    website: 'https://trustwallet.com/',
    description:
      'Trust Wallet Token, or TWT, is a simple BEP-20 utility token that provides a range of benefits and incentives to Trust Wallet users.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4b0f1812e5df2a09796481ff14017e6005508003.png',
  },
  XVS: {
    name: 'Venus',
    symbol: 'XVS',
    address: '0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63',
    chainId: 56,
    decimals: 18,
    website: 'https://trustwallet.com/',
    description:
      'Trust Wallet Token, or TWT, is a simple BEP-20 utility token that provides a range of benefits and incentives to Trust Wallet users.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63.png',
  },
  Beer: {
    name: 'Beer Garden',
    symbol: 'Beer',
    address: '0xbB8DB5e17BBe9c90Da8E3445E335b82d7cc53575',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbb8db5e17bbe9c90da8e3445e335b82d7cc53575.png',
  },
  ALPHA: {
    name: 'AlphaToken',
    symbol: 'ALPHA',
    address: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975',
    chainId: 56,
    decimals: 18,
    website: 'https://alphafinance.io/',
    description:
      'Alpha Finance Lab is a DeFi Lab, and on a mission to build Alpha Universe. Alpha Universe includes the Alpha ecosystem, which consists of Alpha products that interoperate to maximize returns while minimizing risks for users, and other ecosystems incubated through the Alpha Launchpad incubator program.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xa1faa113cbe53436df28ff0aee54275c13b40975.png',
  },
  BIFI: {
    name: 'Beefy.finance',
    symbol: 'BIFI',
    address: '0xCa3F508B8e4Dd382eE878A314789373D80A5190A',
    chainId: 56,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy.Finance (BIFI), is a yield optimization tool on the Binance Smart Chain that helps maximize the return from yield farming.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xCa3F508B8e4Dd382eE878A314789373D80A5190A.png',
  },
  YFI: {
    name: 'yearn.finance',
    symbol: 'YFI',
    address: '0x88f1A5ae2A3BF98AEAF342D26B30a79438c9142e',
    chainId: 56,
    decimals: 18,
    website: 'https://yearn.finance/',
    description:
      'Yearn.finance is an aggregator service for decentralized finance (DeFi) investors, using automation to allow them to maximize profits from yield farming.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x88f1a5ae2a3bf98aeaf342d26b30a79438c9142e.png',
  },
  UNI: {
    name: 'Uniswap',
    symbol: 'UNI',
    address: '0xBf5140A22578168FD562DCcF235E5D43A02ce9B1',
    chainId: 56,
    decimals: 18,
    website: 'https://uniswap.org/',
    description:
      'UNI is the governance token for Uniswap. UNI was introduced on 16th September 2020 through a retrospective airdrop to users who have interacted with the protocol either by swapping tokens or by providing liquidity.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbf5140a22578168fd562dccf235e5d43a02ce9b1.png',
  },
  FRIES: {
    name: 'fry.world',
    symbol: 'FRIES',
    address: '0x393B312C01048b3ed2720bF1B090084C09e408A1',
    chainId: 56,
    decimals: 18,
    website: 'https://fry.world/',
    description:
      'Fries is described to potentially be one of the first projects to build the infrastructure required for yield optimizing strategies on the Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x393B312C01048b3ed2720bF1B090084C09e408A1.png',
  },
  STAX: {
    name: 'StableXSwap',
    symbol: 'STAX',
    address: '0x0Da6Ed8B13214Ff28e9Ca979Dd37439e8a88F6c4',
    chainId: 56,
    decimals: 18,
    website: 'https://www.stablex.finance/',
    description:
      'StableXSwap is a stablecoin-focused AMM-style decentralized exchange built on Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0da6ed8b13214ff28e9ca979dd37439e8a88f6c4.png',
  },
  FIL: {
    name: 'Filecoin',
    symbol: 'FIL',
    address: '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153',
    chainId: 56,
    decimals: 18,
    website: 'https://filecoin.io/',
    description:
      'Filecoin is a decentralized storage system that aims to “store humanity’s most important information.”.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153.png',
  },
  KAVA: {
    name: 'KAVA',
    symbol: 'KAVA',
    address: '0x5F88AB06e8dfe89DF127B2430Bba4Af600866035',
    chainId: 56,
    decimals: 6,
    website: 'https://www.kava.io/',
    description:
      'Kava is a cross-chain DeFi lending platform that allows users to borrow USDX stablecoins and deposit a variety of cryptocurrencies to begin earning a yield.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5F88AB06e8dfe89DF127B2430Bba4Af600866035.png',
  },
  USDX: {
    name: 'USDX',
    symbol: 'USDX',
    address: '0x1203355742e76875154C0D13eB81DCD7711dC7d9',
    chainId: 56,
    decimals: 6,
    website: 'https://www.kava.io/',
    description: 'USDX is the crypto-backed native stablecoin of the Kava DeFi hub.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1203355742e76875154c0d13eb81dcd7711dc7d9.png',
  },
  INJ: {
    name: 'Injective Protocol',
    symbol: 'INJ',
    address: '0xa2B726B1145A4773F68593CF171187d8EBe4d495',
    chainId: 56,
    decimals: 18,
    website: 'https://injectiveprotocol.com/',
    description:
      'The Injective Protocol project is a revolutionary idea that aims to make currency exchanges completely decentralized, public operated networks.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xa2B726B1145A4773F68593CF171187d8EBe4d495.png',
  },
  SXP: {
    name: 'Swipe',
    symbol: 'SXP',
    address: '0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A',
    chainId: 56,
    decimals: 18,
    website: 'https://swipe.io/',
    description:
      'Swipe powers a robust platform that enable businesses to create card programs for users to spend anything globally.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x47bead2563dcbf3bf2c9407fea4dc236faba485a.png',
  },
  USDC: {
    name: 'Binance-Peg USD Coin',
    symbol: 'USDC',
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    chainId: 56,
    decimals: 18,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d.png',
  },
  CTK: {
    name: 'CertiK Token',
    symbol: 'CTK',
    address: '0xA8c2B8eec3d368C0253ad3dae65a5F2BBB89c929',
    chainId: 56,
    decimals: 6,
    website: 'https://www.certik.org/',
    description:
      'CertiK Chain is a security-first, delegated proof-of-stake blockchain, for trustworthy execution of mission-critical applications, including DeFi, NFTs, and autonomous vehicles.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xa8c2b8eec3d368c0253ad3dae65a5f2bbb89c929.png',
  },
  DANGO: {
    name: 'DANGO',
    symbol: 'DANGO',
    address: '0x0957C57C9EB7744850dCC95db5A06eD4a246236E',
    chainId: 56,
    decimals: 6,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0957c57c9eb7744850dcc95db5a06ed4a246236e.png',
  },
  HARD: {
    name: 'HARD',
    symbol: 'HARD',
    address: '0xf79037F6f6bE66832DE4E7516be52826BC3cBcc4',
    chainId: 56,
    decimals: 6,
    website: 'https://www.hard.kava.io/',
    description:
      'HARD Protocol is a decentralized money market built on Kava, enabling the lending and borrowing of cross-chain assets.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf79037f6f6be66832de4e7516be52826bc3cbcc4.png',
  },
  bROOBEE: {
    name: 'ROOBEE',
    symbol: 'bROOBEE',
    address: '0xE64F5Cb844946C1F102Bd25bBD87a5aB4aE89Fbe',
    chainId: 56,
    decimals: 18,
    website: 'https://roobee.io/',
    description:
      'Roobee (ROOBEE) is a blockchain-based investment platform that allows users to invest in products from both the traditional and crypto markets.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe64f5cb844946c1f102bd25bbd87a5ab4ae89fbe.png',
  },
  UNFI: {
    name: 'Unifi Token',
    symbol: 'UNFI',
    address: '0x728C5baC3C3e370E372Fc4671f9ef6916b814d8B',
    chainId: 56,
    decimals: 18,
    website: 'https://unifiprotocol.com/',
    description:
      'Unifi Protocol combines the power of several blockchains and relies on the foundation of Ethereum DApp and DeFi development. However, Unifi makes it its mission to introduce interoperability to the world of DeFi by allowing users access to multiple blockchains and an extremely versatile UNFI token.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x728C5baC3C3e370E372Fc4671f9ef6916b814d8B.png',
  },
  QUSD: {
    name: 'QUSD Stablecoin',
    symbol: 'QUSD',
    address: '0xb8C540d00dd0Bf76ea12E4B4B95eFC90804f924E',
    chainId: 56,
    decimals: 18,
    website: 'https://qian.finance/',
    description: 'QUSD is the stablecoin developed by the QIAN protocol.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xb8C540d00dd0Bf76ea12E4B4B95eFC90804f924E.png',
  },
  VAI: {
    name: 'VAI Stablecoin',
    symbol: 'VAI',
    address: '0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7',
    chainId: 56,
    decimals: 18,
    website: 'https://venus.io/',
    description:
      'Vai is a decentralized stablecoin built on the Venus Protocol that runs on the Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x4bd17003473389a42daf6a0a729f6fdb328bbbd7.png',
  },
  JUV: {
    name: 'Juventus',
    symbol: 'JUV',
    address: '0xC40C9A843E1c6D01b7578284a9028854f6683b1B',
    chainId: 56,
    decimals: 2,
    website: 'https://www.socios.com/juventus/',
    description:
      'Juventus Fan Tokens can be used in the Socios.com app, where users acquire voting rights to influence the clubs they support.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc40c9a843e1c6d01b7578284a9028854f6683b1b.png',
  },
  PSG: {
    name: 'Paris Saint-Germain',
    symbol: 'PSG',
    address: '0xBc5609612b7C44BEf426De600B5fd1379DB2EcF1',
    chainId: 56,
    decimals: 2,
    website: 'https://www.socios.com/paris-saint-germain/',
    description:
      'Paris Saint-Germain Fan Tokens can be used in the Socios.com app, where users acquire voting rights to influence the clubs they support.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbc5609612b7c44bef426de600b5fd1379db2ecf1.png',
  },
  MATH: {
    name: 'Math',
    symbol: 'MATH',
    address: '0xF218184Af829Cf2b0019F8E6F0b2423498a36983',
    chainId: 56,
    decimals: 18,
    website: 'https://mathwallet.org/en-us/',
    description: 'MATH is a multi-chain and cross-chain blockchain assets hub.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf218184af829cf2b0019f8e6f0b2423498a36983.png',
  },
  FUEL: {
    name: 'Fuel',
    symbol: 'FUEL',
    address: '0x2090c8295769791ab7A3CF1CC6e0AA19F35e441A',
    chainId: 56,
    decimals: 18,
    website: 'https://jetfuel.finance/',
    description:
      'Jetfuel is a yield farming and yield aggregator platform that combines features from the most successful DeFi projects.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2090c8295769791ab7A3CF1CC6e0AA19F35e441A.png',
  },
  NULS: {
    name: 'Nuls',
    symbol: 'NULS',
    address: '0x8CD6e29d3686d24d3C2018CEe54621eA0f89313B',
    chainId: 56,
    decimals: 8,
    website: 'https://nuls.io/',
    description:
      'NULS is a microservices-driven blockchain project that uses the Proof of Credit (PoC) consensus mechanism (dPoS plus credit rating) to mine via staking.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8cd6e29d3686d24d3c2018cee54621ea0f89313b.png',
  },
  NVT: {
    name: 'NerveNetwork',
    symbol: 'NVT',
    address: '0xf0E406c49C63AbF358030A299C0E00118C4C6BA5',
    chainId: 56,
    decimals: 8,
    website: 'https://nerve.network/',
    description:
      'Nerve is a decentralized digital asset service network based on the NULS micro-services framework, which uses the NULS ChainBox to develop a blockchain cross-chain interaction protocol.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf0e406c49c63abf358030a299c0e00118c4c6ba5.png',
  },
  REEF: {
    name: 'Reef',
    symbol: 'REEF',
    address: '0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e',
    chainId: 56,
    decimals: 18,
    website: 'https://reef.finance/',
    description:
      'Reef Chain is an EVM compatible chain for DeFi. It is fast, scalable, has low transaction costs and does no wasteful mining. It is built with Polkadot Substrate and comes with on-chain governance.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf21768ccbc73ea5b6fd3c687208a7c2def2d966e.png',
  },
  OG: {
    name: 'OG',
    symbol: 'OG',
    address: '0xf05E45aD22150677a017Fbd94b84fBB63dc9b44c',
    chainId: 56,
    decimals: 2,
    website: 'https://www.socios.com/og/',
    description:
      'OG Fan Tokens can be used in the Socios.com app, where users acquire voting rights to influence the clubs they support.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf05e45ad22150677a017fbd94b84fbb63dc9b44c.png',
  },
  ATM: {
    name: 'Atletico de Madrid',
    symbol: 'ATM',
    address: '0x25E9d05365c867E59C1904E7463Af9F312296f9E',
    chainId: 56,
    decimals: 2,
    website: 'https://www.socios.com/atletico-de-madrid/',
    description:
      'Atletico de Madrid Fan Tokens can be used in the Socios.com app, where users acquire voting rights to influence the clubs they support.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x25e9d05365c867e59c1904e7463af9f312296f9e.png',
  },
  ASR: {
    name: 'AS Roma',
    symbol: 'ASR',
    address: '0x80D5f92C2c8C682070C95495313dDB680B267320',
    chainId: 56,
    decimals: 2,
    website: 'https://www.socios.com/asroma/',
    description:
      'AS Roma Fan Tokens can be used in the Socios.com app, where users acquire voting rights to influence the clubs they support.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x80d5f92c2c8c682070c95495313ddb680b267320.png',
  },
  bALBT: {
    name: 'AllianceBlock',
    symbol: 'bALBT',
    address: '0x72fAa679E1008Ad8382959FF48E392042A8b06f7',
    chainId: 56,
    decimals: 18,
    website: 'https://allianceblock.io/',
    description:
      'The AllianceBlock Protocol is a decentralized, blockchain-agnostic layer 2 that bridges traditional and decentralized finance and automates the process of converting any digital or crypto asset into a bankable product.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x72faa679e1008ad8382959ff48e392042a8b06f7.png',
  },
  TEN: {
    name: 'Tenet',
    symbol: 'TEN',
    address: '0xdFF8cb622790b7F92686c722b02CaB55592f152C',
    chainId: 56,
    decimals: 18,
    website: 'https://tenet.farm/',
    description:
      'Tenet is a cross-chain Automated Market Maker (AMM) connector that provides a decentralized Liquidity Tap for various tokens.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xdff8cb622790b7f92686c722b02cab55592f152c.png',
  },
  Helmet: {
    name: 'Helmet.insure',
    symbol: 'Helmet',
    address: '0x948d2a81086A075b3130BAc19e4c6DEe1D2E3fE8',
    chainId: 56,
    decimals: 18,
    website: 'https://www.helmet.insure/',
    description:
      'Helmet.insure is a peer-to-peer (P2P) price-shield insurance protocol launched in January 2021 on Binance Smart Chain (BSC) with the aim to redefine option trading with user-friendly insurance policy wrapping.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x948d2a81086a075b3130bac19e4c6dee1d2e3fe8.png',
  },
  BSCX: {
    name: 'BSCEX',
    symbol: 'BSCX',
    address: '0x5Ac52EE5b2a633895292Ff6d8A89bB9190451587',
    chainId: 56,
    decimals: 18,
    website: 'https://bscex.org/',
    description:
      'BSCex is a decentralized non-custodial cryptocurrency exchange-centered ecosystem that runs on Binance Smart Chain (BSC).',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5ac52ee5b2a633895292ff6d8a89bb9190451587.png',
  },
  BTCST: {
    name: 'Standard BTC Hashrate Token',
    symbol: 'BTCST',
    address: '0x78650B139471520656b9E7aA7A5e9276814a38e9',
    chainId: 56,
    decimals: 17,
    website: 'https://www.btcst.finance/',
    description:
      'BTCST’s goal is to bridge liquidity to Bitcoin’s mining market. This will allow users to get exposure to mining rewards and hashpower of any size, at a low cost. The ultimate goal of the app is to increase the liquidity and efficiency of mining power markets.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x78650b139471520656b9e7aa7a5e9276814a38e9.png',
  },
  FRONT: {
    name: 'Frontier Token',
    symbol: 'FRONT',
    address: '0x928e55daB735aa8260AF3cEDadA18B5f70C72f1b',
    chainId: 56,
    decimals: 18,
    website: 'https://frontier.xyz/',
    description:
      'Frontier is a chain-agnostic DeFi aggregation layer. In short, Frontierʼs core mission is to bring the essential pieces of DeFi to users across whichever platforms they prefer.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x928e55daB735aa8260AF3cEDadA18B5f70C72f1b.png',
  },
  WSOTE: {
    name: 'Soteria',
    symbol: 'WSOTE',
    address: '0x541E619858737031A1244A5d0Cd47E5ef480342c',
    chainId: 56,
    decimals: 18,
    website: 'https://soteria.finance/',
    description: 'Soteria is a blockchain based mutual to share the risks of DeFi.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x541e619858737031a1244a5d0cd47e5ef480342c.png',
  },
  UST: {
    name: 'UST Token',
    symbol: 'UST',
    address: '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
    chainId: 56,
    decimals: 18,
    website: 'https://mirror.finance/',
    description:
      'TerraUSD (UST) is the decentralized and algorithmic stablecoin of the Terra blockchain. It is a scalable, yield-bearing coin that is value-pegged to the US Dollar.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x23396cF899Ca06c4472205fC903bDB4de249D6fC.png',
  },
  EGLD: {
    name: 'Elrond',
    symbol: 'EGLD',
    address: '0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe',
    chainId: 56,
    decimals: 18,
    website: 'https://elrond.com/',
    description:
      'EGLD is a highly scalable, fast and secure blockchain platform for distributed apps, enterprise use cases and the new internet economy.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbf7c81fff98bbe61b40ed186e4afd6ddd01337fe.png',
  },
  LIT: {
    name: 'Litentry',
    symbol: 'LIT',
    address: '0xb59490aB09A0f526Cc7305822aC65f2Ab12f9723',
    chainId: 56,
    decimals: 18,
    website: 'https://www.litentry.com/',
    description:
      'LIT is a network that supports cross-chain aggregated identities. Build on Substrate, ready for Polkadot.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xb59490ab09a0f526cc7305822ac65f2ab12f9723.png',
  },
  LINA: {
    name: 'Linear Finance',
    symbol: 'LINA',
    address: '0x762539b45A1dCcE3D36d080F74d1AED37844b878',
    chainId: 56,
    decimals: 18,
    website: 'https://linear.finance/',
    description:
      'Linear is a decentralized delta-one asset protocol capable of instantly creating synthetic assets with unlimited liquidity.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x762539b45a1dcce3d36d080f74d1aed37844b878.png',
  },
  BETH: {
    name: 'Beacon ETH',
    symbol: 'BETH',
    address: '0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B',
    chainId: 56,
    decimals: 18,
    website: 'https://ethereum.org/en/eth2/beacon-chain/',
    description:
      'Beacon ETH is the token of Beacon Chain. Beacon Chain will introduce proof-of-stake to Ethereum.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x250632378e573c6be1ac2f97fcdf00515d0aa91b.png',
  },
  lUSD: {
    name: 'lUSD',
    symbol: 'lUSD',
    address: '0x23e8a70534308a4AAF76fb8C32ec13d17a3BD89e',
    chainId: 56,
    decimals: 18,
    website: 'https://www.liquity.org/',
    description: 'LUSD is the USD-pegged stablecoin used to pay out loans on the Liquity protocol.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x23e8a70534308a4AAF76fb8C32ec13d17a3BD89e.png',
  },
  SFP: {
    name: 'SafePal Token',
    symbol: 'SFP',
    address: '0xD41FDb03Ba84762dD66a0af1a6C8540FF1ba5dfb',
    chainId: 56,
    decimals: 18,
    website: 'https://www.safepal.io/',
    description:
      'SafePal is a cryptocurrency wallet launched in 2018 that helps users to protect and grow their digital assets.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xd41fdb03ba84762dd66a0af1a6c8540ff1ba5dfb.png',
  },
  COMP: {
    name: 'Compound Finance',
    symbol: 'COMP',
    address: '0x52CE071Bd9b1C4B00A0b92D298c512478CaD67e8',
    chainId: 56,
    decimals: 18,
    website: 'https://compound.finance/',
    description:
      'Compound is a DeFi lending protocol that allows users to earn interest on their cryptocurrencies by depositing them into one of several pools supported by the platform.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x52ce071bd9b1c4b00a0b92d298c512478cad67e8.png',
  },
  SWGB: {
    name: 'Swirge Pay',
    symbol: 'SWGB',
    address: '0xE40255C5d7fa7ceEc5120408C78C787CECB4cfdb',
    chainId: 56,
    decimals: 18,
    website: 'https://www.swirge.com/',
    description:
      'Swirge Finance is a Swirge subsidiary focused on building decentralized financial products on the blockchain like a Multi-chain yield optimizer and staking platform operating on Binance Smart Chain',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xe40255c5d7fa7ceec5120408c78c787cecb4cfdb.png',
  },
  renBTC: {
    name: 'renBTC',
    symbol: 'renBTC',
    address: '0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c',
    chainId: 56,
    decimals: 8,
    website: 'https://renproject.io/',
    description:
      'RenBTC is an ERC-20 token built on the Ethereum network, pegged to Bitcoin. This means that each RenBTC can be always redeemed for one Bitcoin, and hence tends to maintain its value at close to the Bitcoin market rate.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c.png',
  },
  renDOGE: {
    name: 'renDOGE',
    symbol: 'renDOGE',
    address: '0xc3fEd6eB39178A541D274e6Fc748d48f0Ca01CC3',
    chainId: 56,
    decimals: 8,
    website: 'https://renproject.io/',
    description:
      'RenDOGE is an ERC-20 token built on the Ethereum network, pegged to Dogecoin. This means that each RenDoge can be always redeemed for one Dogecoin, and hence tends to maintain its value at close to the Dogecoin market rate.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc3fed6eb39178a541d274e6fc748d48f0ca01cc3.png',
  },
  anyMTLX: {
    name: 'anyMTLX',
    symbol: 'anyMTLX',
    address: '0x5921DEE8556c4593EeFCFad3CA5e2f618606483b',
    chainId: 56,
    decimals: 18,
    website: 'https://mettalex.com/',
    description:
      'Mettalex is the first decentralised derivatives exchange (DEX) powered by Fetch.ai technology.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5921dee8556c4593eefcfad3ca5e2f618606483b.png',
  },
  ZEE: {
    name: 'ZeroSwapToken',
    symbol: 'ZEE',
    address: '0x44754455564474A89358B2C2265883DF993b12F0',
    chainId: 56,
    decimals: 18,
    website: 'https://zeroswap.io/',
    description:
      'ZeroSwap.io is a Multi-Chain, Zero-fee, On-chain Trading protocol with Liquidity Mining, DeFi Token Offering, and DEX Aggregation.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x44754455564474a89358b2c2265883df993b12f0.png',
  },
  BRY: {
    name: 'Berry',
    symbol: 'BRY',
    address: '0xf859Bf77cBe8699013d6Dbc7C2b926Aaf307F830',
    chainId: 56,
    decimals: 18,
    website: 'https://berrydata.co/',
    description: 'Berry is a decentralized oracle network on the Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xf859Bf77cBe8699013d6Dbc7C2b926Aaf307F830.png',
  },
  SWINGBY: {
    name: 'Swingby',
    symbol: 'SWINGBY',
    address: '0x71DE20e0C4616E7fcBfDD3f875d568492cBE4739',
    chainId: 56,
    decimals: 18,
    website: 'https://swingby.network/',
    description:
      'Swingby is a decentralized proof-of-stake network that uses the latest advancements in cryptography research to allow you to move your tokens onto other chains without a trusted party.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x71DE20e0C4616E7fcBfDD3f875d568492cBE4739.png',
  },
  DODO: {
    name: 'Dodo',
    symbol: 'DODO',
    address: '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2',
    chainId: 56,
    decimals: 18,
    website: 'https://dodoex.io/',
    description:
      'DODO is a DeFi protocol decentralized finance (DeFi) protocol and on-chain liquidity provider whose unique proactive market maker (PMM) algorithm aims to offer better liquidity and price stability than automated market makers (AMM).',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x67ee3cb086f8a16f34bee3ca72fad36f7db929e2.png',
  },
  SUSHI: {
    name: 'Sushi',
    symbol: 'SUSHI',
    address: '0x947950BcC74888a40Ffa2593C5798F11Fc9124C4',
    chainId: 56,
    decimals: 18,
    website: 'https://www.sushi.com/',
    description:
      'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x947950bcc74888a40ffa2593c5798f11fc9124c4.png',
  },
  BOPEN: {
    name: 'OPEN Governance Token',
    symbol: 'BOPEN',
    address: '0xF35262a9d427F96d2437379eF090db986eaE5d42',
    chainId: 56,
    decimals: 18,
    website: 'https://opendao.io/',
    description: 'The OPEN project is a toolkit to connect the real world to DEFI',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xF35262a9d427F96d2437379eF090db986eaE5d42.png',
  },
  BOR: {
    name: 'BoringDAO',
    symbol: 'BOR',
    address: '0x92D7756c60dcfD4c689290E8A9F4d263b3b32241',
    chainId: 56,
    decimals: 18,
    website: 'https://www.boringdao.com/',
    description:
      'BoringDAO deploys a series of decentralized bridges - or tunnels - which allow you to safely move your Bitcoin & other crypto assets between Ethereum & different blockchains to maximize utilization rate of crypto assets in DeFi world.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x92d7756c60dcfd4c689290e8a9f4d263b3b32241.png',
  },
  renZEC: {
    name: 'renZEC',
    symbol: 'renZEC',
    address: '0x695FD30aF473F2960e81Dc9bA7cB67679d35EDb7',
    chainId: 56,
    decimals: 8,
    website: 'https://renproject.io/',
    description:
      'RenZEC is an ERC-20 token built on the Ethereum network, pegged to ZCash. This means that each RenZEC can be always redeemed for one ZCash, and hence tends to maintain its value at close to the ZCash market rate.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x695FD30aF473F2960e81Dc9bA7cB67679d35EDb7.png',
  },
  IOTX: {
    name: 'IoTeX',
    symbol: 'IOTX',
    address: '0x9678E42ceBEb63F23197D726B29b1CB20d0064E5',
    chainId: 56,
    decimals: 18,
    website: 'https://iotex.io/',
    description:
      'IoTeX is an open ecosystem where people and machines can interact with guaranteed trust, free will, and under properly designed economic incentives.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x9678e42cebeb63f23197d726b29b1cb20d0064e5.png',
  },
  XMARK: {
    name: 'xMARK',
    symbol: 'XMARK',
    address: '0x26A5dFab467d4f58fB266648CAe769503CEC9580',
    chainId: 56,
    decimals: 9,
    website: 'https://benchmarkprotocol.finance/',
    description:
      'Benchmark Protocol is an elastic stablecoin-alternative bridging capital markets to DeFi.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x26a5dfab467d4f58fb266648cae769503cec9580.png',
  },
  TPT: {
    name: 'TokenPocket',
    symbol: 'TPT',
    address: '0xECa41281c24451168a37211F0bc2b8645AF45092',
    chainId: 56,
    decimals: 4,
    website: 'https://tokenpocket.pro/',
    description:
      'TPT is an applicational token representing TokenPocket users and developers’ rights in the TP ecosystem.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xeca41281c24451168a37211f0bc2b8645af45092.png',
  },
  WATCH: {
    name: 'Yieldwatch',
    symbol: 'WATCH',
    address: '0x7A9f28EB62C791422Aa23CeAE1dA9C847cBeC9b0',
    chainId: 56,
    decimals: 18,
    website: 'https://www.yieldwatch.net/',
    description:
      'Yieldwatch.net is a smart yield farming dashboard that lets you monitor your liquidity pools, yield farming and token staking performance with a casual and sleek UI, which is optimised for mobile use.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0.png',
  },
  DEXE: {
    name: 'DeXe',
    symbol: 'DEXE',
    address: '0x039cB485212f996A9DBb85A9a75d898F94d38dA6',
    chainId: 56,
    decimals: 18,
    website: 'https://dexe.network/',
    description:
      'Dexe is a decentralized social trading platform designed to copy the best traders strategies.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x039cb485212f996a9dbb85a9a75d898f94d38da6.png',
  },
  RAMP: {
    name: 'Ramp DEFI',
    symbol: 'RAMP',
    address: '0x8519EA49c997f50cefFa444d240fB655e89248Aa',
    chainId: 56,
    decimals: 18,
    website: 'https://www.rampdefi.com/',
    description:
      'RAMP DeFi is a multi-chain DeFi protocol that helps asset owners achieve capital efficiency by offering a powerful and comprehensive solution to multi-task users’ crypto-assets, maximizing the value and returns.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8519ea49c997f50ceffa444d240fb655e89248aa.png',
  },
  BELT: {
    name: 'Belt',
    symbol: 'BELT',
    address: '0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f',
    chainId: 56,
    decimals: 18,
    website: 'https://belt.fi/bsc',
    description:
      'Belt.fi is a protocol that allows users to retain the stability of their asset positions and get maximum yields with minimal risk, including automated vault compounding and yield optimization strategies.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f.png',
  },
  BAT: {
    name: 'Basic Attention Token',
    symbol: 'BAT',
    address: '0x101d82428437127bF1608F699CD651e6Abf9766E',
    chainId: 56,
    decimals: 18,
    website: 'https://basicattentiontoken.org/',
    description:
      'Basic Attention Token, or BAT, is the token that powers a new blockchain-based digital advertising platform designed to fairly reward users for their attention, while providing advertisers with a better return on their ad spend.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x101d82428437127bf1608f699cd651e6abf9766e.png',
  },
  BUX: {
    name: 'BUX',
    symbol: 'BUX',
    address: '0x211FfbE424b90e25a15531ca322adF1559779E45',
    chainId: 56,
    decimals: 18,
    website: 'https://bux-c.com/',
    description:
      'The BUX Token (BUX) is a Binance Smart Chain powered BEP20 utility token that can be used on the BUX Crypto platform to trade with 0% commission and access premium features.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x211ffbe424b90e25a15531ca322adf1559779e45.png',
  },
  ALICE: {
    name: 'My Neigbor Alice',
    symbol: 'ALICE',
    address: '0xAC51066d7bEC65Dc4589368da368b212745d63E8',
    chainId: 56,
    decimals: 6,
    website: 'https://www.myneighboralice.com/',
    description:
      'My Neighbor Alice is a multiplayer builder game, where anyone can buy and own virtual islands, collect and build exciting items and meet new friends.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xac51066d7bec65dc4589368da368b212745d63e8.png',
  },
  BUNNY: {
    name: 'Pancake Bunny',
    symbol: 'BUNNY',
    address: '0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51',
    chainId: 56,
    decimals: 18,
    website: 'https://pancakebunny.finance/',
    description:
      'PancakeBunny is a decentralized finance (DeFi) yield aggregator and optimizer for the Binance Smart Chain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc9849e6fdb743d08faee3e34dd2d1bc69ea11a51.png',
  },
  COS: {
    name: 'Contentos',
    symbol: 'COS',
    address: '0x96Dd399F9c3AFda1F194182F71600F1B65946501',
    chainId: 56,
    decimals: 18,
    website: 'https://www.contentos.io/',
    description:
      'The vision of Contentos is to build a "decentralized digital content community that allows content to be freely produced, distributed, rewarded, and traded, while protecting author rights".',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x96dd399f9c3afda1f194182f71600f1b65946501.png',
  },
  TXL: {
    name: 'Tixl',
    symbol: 'TXL',
    address: '0x1FFD0b47127fdd4097E54521C9E2c7f0D66AafC5',
    chainId: 56,
    decimals: 18,
    website: 'https://tixl.org/',
    description: 'Tixl aims to build a high-performance network to connect all blockchains.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1ffd0b47127fdd4097e54521c9e2c7f0d66aafc5.png',
  },
  ALPACA: {
    name: 'Alpaca',
    symbol: 'ALPACA',
    address: '0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F',
    chainId: 56,
    decimals: 18,
    website: 'https://www.alpacafinance.org/',
    description:
      'Alpaca Finance helps lenders earn safe and stable yields, and offers borrowers undercollateralized loans for leveraged yield farming positions, vastly multiplying their farming principals and resulting profits.‌',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8f0528ce5ef7b51152a59745befdd91d97091d2f.png',
  },
  DUSK: {
    name: 'Dusk',
    symbol: 'DUSK',
    address: '0xB2BD0749DBE21f623d9BABa856D3B0f0e1BFEc9C',
    chainId: 56,
    decimals: 18,
    website: 'https://dusk.network/',
    description:
      'Dusk Network is technology for securities. An open source and secure blockchain (DLT) infrastructure that businesses use to tokenize financial instruments and automate costly processes.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xb2bd0749dbe21f623d9baba856d3b0f0e1bfec9c.png',
  },
  bDIGG: {
    name: 'bDIGG',
    symbol: 'bDIGG',
    address: '0x5986D5c77c65e5801a5cAa4fAE80089f870A71dA',
    chainId: 56,
    decimals: 18,
    website: 'https://badger.finance/',
    description: 'An elastic BTC-pegged token governed by the Badger DAO.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5986d5c77c65e5801a5caa4fae80089f870a71da.png',
  },
  bBADGER: {
    name: 'bBADGER',
    symbol: 'bBADGER',
    address: '0x1F7216fdB338247512Ec99715587bb97BBf96eae',
    chainId: 56,
    decimals: 18,
    website: 'https://badger.finance/',
    description:
      'Badger DAO is an open-source, decentralized automated organization that is dedicated to building products and infrastructure of simplifying the use of Bitcoin (BTC) as collateral across many smart contract platforms.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1f7216fdb338247512ec99715587bb97bbf96eae.png',
  },
  TRADE: {
    name: 'Unitrade',
    symbol: 'TRADE',
    address: '0x7af173F350D916358AF3e218Bdf2178494Beb748',
    chainId: 56,
    decimals: 18,
    website: 'https://www.unitrade.app/',
    description:
      'Unitrade is embracing all of DeFi on multiple blockchains to introduce a combination of the most impactful and innovative financial offerings that have shaken the core of traditional finance in a single refined app.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7af173f350d916358af3e218bdf2178494beb748.png',
  },
  PNT: {
    name: 'PNT',
    symbol: 'PNT',
    address: '0xdaacB0Ab6Fb34d24E8a67BfA14BF4D95D4C7aF92',
    chainId: 56,
    decimals: 18,
    website: 'https://p.network/',
    description:
      'pNetwork is a solution enabling cross-chain interactions between dApps on multiple networks.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7a1da9f49224ef98389b071b8a3294d1cc5e3e6a.png',
  },
  pBTC: {
    name: 'pBTC',
    symbol: 'pBTC',
    address: '0xeD28A457A5A76596ac48d87C0f577020F6Ea1c4C',
    chainId: 56,
    decimals: 18,
    website: 'https://p.network/',
    description: 'pBTC is a 1:1 pegged ERC777 Bitcoin representation on Ethereum.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xed28a457a5a76596ac48d87c0f577020f6ea1c4c.png',
  },
  MIR: {
    name: 'Mirror Finance',
    symbol: 'MIR',
    address: '0x5B6DcF557E2aBE2323c48445E8CC948910d8c2c9',
    chainId: 56,
    decimals: 18,
    website: 'https://mirror.finance/',
    description:
      'MIR is the governance token of Mirror Protocol, a synthetic assets protocol built by Terraform Labs (TFL) on the Terra blockchain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5b6dcf557e2abe2323c48445e8cc948910d8c2c9.png',
  },
  pCWS: {
    name: 'PolyCrowns',
    symbol: 'pCWS',
    address: '0xbcf39F0EDDa668C58371E519AF37CA705f2bFcbd',
    chainId: 56,
    decimals: 18,
    website: 'https://game.seascape.network/',
    description:
      'Crowns are the official token of the Seascape Network. As such, they are designed to reward all key stakeholders within the network.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbcf39f0edda668c58371e519af37ca705f2bfcbd.png',
  },
  ZIL: {
    name: 'Zilliqa',
    symbol: 'ZIL',
    address: '0xb86AbCb37C3A4B64f74f59301AFF131a1BEcC787',
    chainId: 56,
    decimals: 12,
    website: 'https://www.zilliqa.com/',
    description:
      'Zilliqa is mainly based on the concept of Sharding and primarily aims at improving the scalability of the cryptocurrency networks as in case of Bitcoin or Ethereum.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xb86abcb37c3a4b64f74f59301aff131a1becc787.png',
  },
  SWTH: {
    name: 'Switcheo',
    symbol: 'SWTH',
    address: '0x250b211EE44459dAd5Cd3bCa803dD6a7EcB5d46C',
    chainId: 56,
    decimals: 8,
    website: 'https://switcheo.org/',
    description:
      'SWTH is the native token of Switcheo, a decentralized exchange based in Singapore.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x250b211EE44459dAd5Cd3bCa803dD6a7EcB5d46C.png',
  },
  EPS: {
    name: 'Ellipsis',
    symbol: 'EPS',
    address: '0xA7f552078dcC247C2684336020c03648500C6d9F',
    chainId: 56,
    decimals: 18,
    website: 'https://ellipsis.finance/',
    description: 'Ellipsis protocol enables extremely efficient stable coin exchanges.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xa7f552078dcc247c2684336020c03648500c6d9f.png',
  },
  DFT: {
    name: 'DFuture',
    symbol: 'DFT',
    address: '0x42712dF5009c20fee340B245b510c0395896cF6e',
    chainId: 56,
    decimals: 18,
    website: 'https://dfuture.com/',
    description:
      'Dfuture is a decentralization futures trading platform that revolutionizes the existing trading model, so that traders, LP and arbitrageurs can have a fairer, safer and more profitable trading environment.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x42712dF5009c20fee340B245b510c0395896cF6e.png',
  },
  GUM: {
    name: 'Gourmet Galaxy',
    symbol: 'GUM',
    address: '0xc53708664b99DF348dd27C3Ac0759d2DA9c40462',
    chainId: 56,
    decimals: 18,
    website: 'https://gourmetgalaxy.io/',
    description:
      'Gourmet Galaxy is an innovative Yield Farming platform, a combination of DeFi and NFTs in a gaming experience.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc53708664b99DF348dd27C3Ac0759d2DA9c40462.png',
  },
  ONE: {
    name: 'Harmony One',
    symbol: 'ONE',
    address: '0x03fF0ff224f904be3118461335064bB48Df47938',
    chainId: 56,
    decimals: 18,
    website: 'https://www.harmony.one/',
    description:
      'Harmony is a blockchain platform designed to facilitate the creation and use of decentralized applications (DApps). The network aims to innovate the way decentralized applications work by focusing on random state sharding, which allows creating blocks in seconds.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x03ff0ff224f904be3118461335064bb48df47938.png',
  },
  EASY: {
    name: 'Easyfi Network',
    symbol: 'EASY',
    address: '0x7C17c8bED8d14bAccE824D020f994F4880D6Ab3B',
    chainId: 56,
    decimals: 18,
    website: 'https://easyfi.network/',
    description:
      'EasyFi is a multi chain layer 2 money markets with structured lending products to accelerate liquidity deployment at remarkably lowest cost & unimaginable fast speed.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7c17c8bed8d14bacce824d020f994f4880d6ab3b.png',
  },
  SAFEMOON: {
    name: 'SafeMoon',
    symbol: 'SAFEMOON',
    address: '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3',
    chainId: 56,
    decimals: 9,
    website: 'https://safemoon.net/',
    description:
      'The SafeMoon Protocol is a community driven, fair launched DeFi Token. Three simple functions occur during each trade: Reflection, LP Acquisition, and Burn.',
    logoURI:
      'https://assets.trustwalletapp.com/blockchains/smartchain/assets/0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3/logo.png',
  },
  tBTC: {
    name: 'Tau Bitcoin',
    symbol: 'tBTC',
    address: '0x2cD1075682b0FCCaADd0Ca629e138E64015Ba11c',
    chainId: 56,
    decimals: 9,
    website: 'https://www.btcst.finance/',
    description:
      'τBitcoin brings Bitcoin to DeFi and its price will be 1:1 pegged to that of Bitcoin. Backed by institutional miners representing 12% of Bitcoin’s global hashrate, τBitcoin will be a synthetic Bitcoin uniquely suitable for DeFi use cases.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2cD1075682b0FCCaADd0Ca629e138E64015Ba11c.png',
  },
  ODDZ: {
    name: 'Oddz',
    symbol: 'ODDZ',
    address: '0xCD40F2670CF58720b694968698A5514e924F742d',
    chainId: 56,
    decimals: 18,
    website: 'https://oddz.fi/',
    description:
      'Oddz is the Multi-chain options trading platform on Binance Smart Chain, Polkadot & Ethereum.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xcd40f2670cf58720b694968698a5514e924f742d.png',
  },
  APYS: {
    name: 'APYSwap',
    symbol: 'APYS',
    address: '0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7',
    chainId: 56,
    decimals: 18,
    website: 'https://apyswap.com/',
    description:
      'ApySwap is a single point of entry for all the most popular and profitable services from such blockchains as Ethereum, Polkadot, Binance Smart Chain, HECO, Tezos, Solana and others.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x37dfACfaeDA801437Ff648A1559d73f4C40aAcb7.png',
  },
  TKO: {
    name: 'TokoCrypto',
    symbol: 'TKO',
    address: '0x9f589e3eabe42ebC94A44727b3f3531C0c877809',
    chainId: 56,
    decimals: 18,
    website: 'https://www.tokocrypto.com/',
    description:
      'The token serves several purposes on the Tokocrypto blockchain platform and allows users to participate in crypto exchanges, deposit and savings programs, cross-platform DeFi applications, and NFT marketplaces.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x9f589e3eabe42ebc94a44727b3f3531c0c877809.png',
  },
  ITAM: {
    name: 'Itam',
    symbol: 'ITAM',
    address: '0x04C747b40Be4D535fC83D09939fb0f626F32800B',
    chainId: 56,
    decimals: 18,
    website: 'https://itam.network/',
    description:
      'The project claims to support game developers with blockchain technology and provide an easy way for existing games to be integrated with blockchain.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x04c747b40be4d535fc83d09939fb0f626f32800b.png',
  },
  ARPA: {
    name: 'ARPA',
    symbol: 'ARPA',
    address: '0x6F769E65c14Ebd1f68817F5f1DcDb61Cfa2D6f7e',
    chainId: 56,
    decimals: 18,
    website: 'https://arpachain.io/',
    description:
      'ARPA is a blockchain-based layer 2 solution for privacy-preserving computation, enabled by Multi-Party Computation (“MPC”).',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x6f769e65c14ebd1f68817f5f1dcdb61cfa2d6f7e.png',
  },
  PERL: {
    name: 'Perlin X',
    symbol: 'PERL',
    address: '0x0F9E4D49f25de22c2202aF916B681FBB3790497B',
    chainId: 56,
    decimals: 18,
    website: 'https://perlinx.finance/',
    description:
      'PerlinX is a decentralized synthetic liquidity pool that supports the creation and trade of synthetic assets.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x0f9e4d49f25de22c2202af916b681fbb3790497b.png',
  },
  JGN: {
    name: 'Juggernaut Finance',
    symbol: 'JGN',
    address: '0xC13B7a43223BB9Bf4B69BD68Ab20ca1B79d81C75',
    chainId: 56,
    decimals: 18,
    website: 'https://jgndefi.com/',
    description:
      'JGN is described to be an unstoppable commerce network that offers custom synthetic DeFi assets to fit any business use case.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc13b7a43223bb9bf4b69bd68ab20ca1b79d81c75.png',
  },
  TLM: {
    name: 'Alien Worlds',
    symbol: 'TLM',
    address: '0x2222227E22102Fe3322098e4CBfE18cFebD57c95',
    chainId: 56,
    decimals: 4,
    website: 'https://alienworlds.io/',
    description:
      'Alien Worlds is a game where you can earn Trilium (TLM) for mining and have a chance to mine an NFT game card each time you mine.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2222227e22102fe3322098e4cbfe18cfebd57c95.png',
  },
  ALPA: {
    name: 'AlpaToken',
    symbol: 'ALPA',
    address: '0xc5E6689C9c8B02be7C49912Ef19e79cF24977f03',
    chainId: 56,
    decimals: 18,
    website: 'https://bsc.alpaca.city/',
    description:
      'Alpaca City is endeavoring to create a more accessible DeFi ecosystem by combining the power of yield farming and NFT.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc5e6689c9c8b02be7c49912ef19e79cf24977f03.png',
  },
  HZN: {
    name: 'Horizon Protocol',
    symbol: 'HZN',
    address: '0xC0eFf7749b125444953ef89682201Fb8c6A917CD',
    chainId: 56,
    decimals: 18,
    website: 'https://horizonprotocol.com/',
    description:
      'Horizon protocol is a defi platform facilitating the creation of on-chain synthetic assets representing the real economy.',
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xC0eFf7749b125444953ef89682201Fb8c6A917CD.png',
  },
  QKC: {
    name: 'QuarkChain Token',
    symbol: 'QKC',
    address: '0xA1434F1FC3F437fa33F7a781E041961C0205B5Da',
    chainId: 56,
    decimals: 18,
    website: 'https://quarkchain.io/',
    description:
      'QuarkChain is a flexible, scalable, and user-oriented blockchain infrastructure by using blockchain sharding technology.',
    logoURI: '',
  },
  BCFX: {
    name: 'BSC Conflux',
    symbol: 'BCFX',
    address: '0x045c4324039dA91c52C55DF5D785385Aab073DcF',
    chainId: 56,
    decimals: 18,
    website: 'https://www.confluxnetwork.org/',
    description:
      'Conflux Network enables the secure and interoperable flow of assets and data to create an internet of value for all.',
    logoURI: 'https://bscscan.com/token/images/conflux_32.png',
  },
  'AMPL-BSC-mp': {
    name: 'Ample BSC (BRG Meter Passport)',
    symbol: 'AMPL-BSC-mp',
    address: '0xDB021b1B247fe2F1fa57e0A87C748Cc1E321F07F',
    chainId: 56,
    decimals: 9,
    website: 'https://www.ampleforth.org/',
    description:
      'AMPL is a cryptocurrency and financial building-block. Much like Bitcoin, it is algorithmic and uncollateralized. However unlike Bitcoin, AMPL can be used to denominate stable contracts.',
    logoURI: '',
  },
  dBTC: {
    name: 'Diamond-Peg BTC',
    symbol: 'dBTC',
    address: '0x6b77F51d4C474EFB15b72B829e6a0806bbc33724',
    chainId: 56,
    decimals: 18,
    website: 'https://diamondhand.fi/',
    description: 'dBTC is a synthetic token pegged to BTC developed by Diamonhand.fi.',
    logoURI: 'https://app.iron.finance/static/media/DBTC.2bb24d53.png',
  },
  dBNB: {
    name: 'Diamond-Peg BNB',
    symbol: 'dBNB',
    address: '0x4101fe75F547A65F6BB054A35F027c16562a45C3',
    chainId: 56,
    decimals: 18,
    website: 'https://diamondhand.fi/',
    description: 'dBNB is a synthetic token pegged to BNB developed by Diamonhand.fi.',
    logoURI: 'https://app.iron.finance/static/media/DBNB.57de3f13.png',
  },
  dETH: {
    name: 'Diamond-Peg ETH',
    symbol: 'dETH',
    address: '0xf633DEb2452918FA5248070C1986BE7a3895F3fC',
    chainId: 56,
    decimals: 18,
    website: 'https://diamondhand.fi/',
    description: 'dETH is a synthetic token pegged to ETH developed by Diamonhand.fi.',
    logoURI: 'https://app.iron.finance/static/media/DETH.4802e6eb.png',
  },
  dADA: {
    name: 'Diamond-Peg ADA',
    symbol: 'dADA',
    address: '0x68169d96a20dFe968B0fe714578969118c08484A',
    chainId: 56,
    decimals: 18,
    website: 'https://diamondhand.fi/',
    description: 'dADA is a synthetic token pegged to ADA developed by Diamonhand.fi.',
    logoURI: 'https://app.iron.finance/static/media/DADA.d9b1a86c.png',
  },
  dDOT: {
    name: 'Diamond-Peg DOT',
    symbol: 'dDOT',
    address: '0x3E3434F57ADF4e07Dc2d75c6F109c20Ac96a1557',
    chainId: 56,
    decimals: 18,
    website: 'https://diamondhand.fi/',
    description: 'dDOT is a synthetic token pegged to DOT developed by Diamonhand.fi.',
    logoURI: '',
  },
  KROWN: {
    name: 'Krown',
    symbol: 'KRW',
    address: '0x1446f3CEdf4d86a9399E49f7937766E6De2A3AAB',
    chainId: 56,
    decimals: 18,
    website: 'https://kingdefi.io/',
    description:
      'KingDeFi is a DeFi project combining two main areas: analytics and monitoring where they provide a market overview, liquidity pool search engine and portfolio tracking to users and farming as they are a yield optimizer project on BSC and Solana.',
    logoURI: 'https://kingdefi.io/assets/images/KRW@2x.png',
  },
  CARROT: {
    name: 'CARROT',
    symbol: 'CARROT',
    address: '0xA5043373edC09f3f7d87Fe35CA933e0a7B59D005',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://mdex.co/token-icons/bsc/0xa5043373edc09f3f7d87fe35ca933e0a7b59d005.png',
    description:
      'Rabbit Finance is a cross-chain leveraged lending protocol, allowing users to multiply (like Rabbits 🐰🐰🐰) their funds up to 9x, thereby maximizing interest and liquidity farming yields.',
    website: 'https://rabbitfinance.io/',
  },
  PERA: {
    name: 'PERA',
    symbol: 'PERA',
    address: '0xb9D8592E16A9c1a3AE6021CDDb324EaC1Cbc70d6',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://app.pera.finance/logo-full.png',
    description:
      "Pera Finance is a DeFi platform where traders, liquidity providers and holders yield farm together through the DeFi's first decentralized trading competition.",
    website: 'https://app.pera.finance/',
  },
  HERO: {
    name: 'FarmHero HERO',
    symbol: 'HERO',
    address: '0x9B26e16377ad29A6CCC01770bcfB56DE3A36d8b2',
    chainId: 56,
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/10620.png',
    description: 'FarmHero.io is a novel protocol that mixes NFT, gaming and DEFI concepts.',
    website: 'https://bsc.farmhero.io/',
  },
  NFT: {
    name: 'APENFT',
    symbol: 'NFT',
    address: '0x1fC9004eC7E5722891f5f38baE7678efCB11d34D',
    chainId: 56,
    decimals: 6,
    logoURI: 'https://www.apenft.org/img/logo.svg',
    description: 'APENFT GALLERY ART FOR EVERYONE',
    website: 'https://www.apenft.org/',
  },
  QUANT: {
    name: 'StableQuant',
    symbol: 'QUANT',
    address: '0xBCA627FEd3b6E8F414C745E12B2b89371497779D',
    chainId: 56,
    decimals: 18,
    description:
      'StableQuant is a simple, stripped-down swap designed to be the go-to DEX for stablecoins',
    website: 'https://stablequant.finance/',
  },
  MCB: {
    name: 'MCDEX Token',
    symbol: 'MCB',
    address: '0x5fE80d2CD054645b9419657d3d10d26391780A7B',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x5fE80d2CD054645b9419657d3d10d26391780A7B.svg',
    website: 'https://mcdex.io/homepage/',
    description:
      'MCDEX is the first fully-permissionless DEX for trading perpetual contracts, powered by MCDEXs revolutionary AMM technology',
  },
  RPG: {
    name: 'Rangers Protocol Gas',
    symbol: 'RPG',
    address: '0xc2098a8938119A52B1F7661893c0153A6CB116d5',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xc2098a8938119A52B1F7661893c0153A6CB116d5.svg',
    website: 'https://rangersprotocol.com/',
    description:
      'Rangers Protocol can realize a high-performance blockchain group with cross-chain contract interoperability among the EVM systems of multiple blockchains.',
  },
  LAZIO: {
    name: 'FC Lazio Fan Token',
    symbol: 'LAZIO',
    address: '0x77d547256A2cD95F32F67aE0313E450Ac200648d',
    chainId: 56,
    decimals: 8,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x77d547256A2cD95F32F67aE0313E450Ac200648d.svg',
    website: 'https://www.sslazio.it/en',
    description:
      'The Lazio Fan Token is a BEP-20 utility token designed to revolutionize the fan experience for all S.S. Lazio supporters.',
  },
  DKT: {
    name: 'Duelist King Token',
    symbol: 'DKT',
    address: '0x7Ceb519718A80Dd78a8545AD8e7f401dE4f2faA7',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7Ceb519718A80Dd78a8545AD8e7f401dE4f2faA7.svg',
    website: 'https://duelistking.com/',
    description:
      'Powered by in-house Decentralized Autonomous Organization (DAO), Oracle and Random Number Generator on DKDAO platform, Duelist King offers dual values for investors from token utilities and card sales (projected at roughly 40 million USD).',
  },
  DAR: {
    name: 'Mines of Dalarnia Token',
    symbol: 'DAR',
    address: '0x23CE9e926048273eF83be0A3A8Ba9Cb6D45cd978',
    chainId: 56,
    decimals: 6,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x23CE9e926048273eF83be0A3A8Ba9Cb6D45cd978.svg',
    website: 'https://www.minesofdalarnia.com/',
    description:
      'Mines of Dalarnia is a free action game with a unique blockchain real-estate market.',
  },
  XWG: {
    name: 'XWG',
    symbol: 'XWG',
    address: '0x6b23C89196DeB721e6Fd9726E6C76E4810a464bc',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x6b23C89196DeB721e6Fd9726E6C76E4810a464bc.svg',
    website: 'https://xwg.games/#/',
    description:
      'A true decentralized ownership of a gaming world via DAO.  Games that hold XWG tokens get to decide the platform governance policy or the next in-game development, including reward mechanisms and tokenomic systems.',
  },
  ETERNAL: {
    name: 'CryptoMines Eternal',
    symbol: 'ETERNAL',
    address: '0xD44FD09d74cd13838F137B590497595d6b3FEeA4',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xD44FD09d74cd13838F137B590497595d6b3FEeA4.svg',
    website: 'https://cryptomines.app/',
    description:
      'CryptoMines is a SciFi play-to-earn NFT game designed to provide the users with a fun experience by collecting and Spaceships to travel through the universe searching for , this mineral allows them to live another day and make some profits along the way.',
  },
  PORTO: {
    name: 'FC Porto Fan Token',
    symbol: 'PORTO',
    address: '0x49f2145d6366099e13B10FbF80646C0F377eE7f6',
    chainId: 56,
    decimals: 8,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x49f2145d6366099e13B10FbF80646C0F377eE7f6.svg',
    website: 'https://www.fcporto.pt/',
    description: 'FC Porto Fan Token',
  },
  KART: {
    name: 'Dragon Kart',
    symbol: 'KART',
    address: '0x8BDd8DBcBDf0C066cA5f3286d33673aA7A553C10',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8BDd8DBcBDf0C066cA5f3286d33673aA7A553C10.svg',
    website: 'https://dragonkart.com/',
    description:
      'In 2088, the planet Kart is invaded by forces from outer space who are called Kaman. They sealed and reorganized the entire planet Kart in order to dominate and plunder their wealth and divide it into many different lands. Each land is run by a Boss. Kaman tries to destroy the entire planet, plunder the wealth to bring back to his planet and exhaust the resources of Kart.',
  },
  bQI: {
    name: 'BENQI',
    symbol: 'QI',
    address: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5.svg',
    website: 'https://app.benqi.fi/overview',
    description: 'BenQI is lending protocol on the Avalanche blockchain',
  },
  Zoo: {
    name: 'ZooToken',
    symbol: 'Zoo',
    address: '0x1D229B958D5DDFca92146585a8711aECbE56F095',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x1D229B958D5DDFca92146585a8711aECbE56F095.svg',
    website: 'https://zoogame.app/#/farm',
    description:
      'Swap, Stake, Battle, Mine - ZOO Crypto World is revolutionising the GameFi space by gamifying DeFi. Battle against your foes, stake in pools or have action-packed fights with mega bosses! ZOO Crypto World is based on the decentralized chain, Binance Smart Chain, which guarantees superior speed and much lower network transaction cost for all ZOO warriors.',
  },
  QUIDD: {
    name: 'QUIDD',
    symbol: 'QUIDD',
    address: '0x7961Ade0a767c0E5B67Dd1a1F78ba44F727642Ed',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x7961Ade0a767c0E5B67Dd1a1F78ba44F727642Ed.svg',
    website: 'https://www.quiddtoken.com/',
    description:
      'Collect officially-licensed digital collectibles from 325 of the worlds most beloved brands.',
  },
  SANTOS: {
    name: 'FC Santos Fan Token',
    symbol: 'SANTOS',
    address: '0xA64455a4553C9034236734FadDAddbb64aCE4Cc7',
    chainId: 56,
    decimals: 8,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xA64455a4553C9034236734FadDAddbb64aCE4Cc7.svg',
    website: 'https://www.santosfc.com.br/en/',
    description: 'FC Santos Fan Token',
  },
  NABOX: {
    name: 'Nabox Token',
    symbol: 'NABOX',
    address: '0x755f34709E369D37C6Fa52808aE84A32007d1155',
    chainId: 56,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x755f34709E369D37C6Fa52808aE84A32007d1155.svg',
    website: 'https://nabox.io/',
    description: 'Cross-Chain DeFi Wallet with Decentralized Identifier for Web 3.0',
  },
} as const;
export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
