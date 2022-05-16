import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const MOVR = {
  name: 'Wrapped MOVR',
  address: '0x98878B06940aE243284CA214f92Bb71a2b032B8A',
  symbol: 'WMOVR',
  decimals: 18,
  chainId: 1285,
  website: 'https://moonbeam.network/networks/moonriver/',
  description:
    'Moonriver is a companion network to Moonbeam and provides a permanently incentivized canary network. New code ships to Moonriver first, where it can be tested and verified under real economic conditions. Once proven, the same code ships to Moonbeam on Polkadot.',
  logoURI:
    'https://app.solarbeam.io/_next/image?url=https%3A%2F%2Fapp.solarbeam.io%2Fimages%2Ftokens%2Fmovr.png&w=32&q=50',
} as const;

const WMOVR_SUSHI = {
  name: 'Wrapped MOVR on Sushiswap',
  address: '0xf50225a84382c74CbdeA10b0c176f71fc3DE0C4d',
  symbol: 'WMOVR',
  decimals: 18,
  chainId: 1285,
  website: 'https://moonbeam.network/networks/moonriver/',
  description:
    'Moonriver is a companion network to Moonbeam and provides a permanently incentivized canary network. New code ships to Moonriver first, where it can be tested and verified under real economic conditions. Once proven, the same code ships to Moonbeam on Polkadot.',
  logoURI:
    'https://app.solarbeam.io/_next/image?url=https%3A%2F%2Fapp.solarbeam.io%2Fimages%2Ftokens%2Fmovr.png&w=32&q=50',
} as const;

const SUSHI = {
  name: 'SUSHI',
  address: '0xf390830DF829cf22c53c8840554B98eafC5dCBc2',
  symbol: 'SUSHI',
  decimals: 18,
  chainId: 1285,
  website: 'https://sushi.com/',
  description:
    'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
  logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
} as const;

const _tokens = {
  MOVR,
  WMOVR: MOVR,
  WNATIVE: MOVR,
  WMOVR_SUSHI: WMOVR_SUSHI,
  WNATIVE_SUSHI: WMOVR_SUSHI,
  BIFI: {
    chainId: 1285,
    address: '0x173fd7434B8B50dF08e3298f173487ebDB35FD14',
    decimals: 18,
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  MAI: {
    name: 'MAI',
    symbol: 'Mai Stablecoin',
    address: '0xFb2019DfD635a03cfFF624D210AEe6AF2B00fC2C',
    chainId: 1285,
    decimals: 18,
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stable coin collateralized by your MATIC holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png',
  },
  DOGE: {
    name: 'Doge Token',
    symbol: 'DOGE',
    address: '0xb668Cd490a4421F993f93be2819A922DBbB32804',
    chainId: 1285,
    decimals: 8,
    logoURI: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=014',
    website: 'https://dogecoin.com/',
    description:
      'Dogecoin is an open source peer-to-peer digital currency, favored by Shiba Inus worldwide.',
  },
  XRP: {
    name: 'XRP Token',
    symbol: 'XRP',
    address: '0x9D5bc9B873AeD984e2B6A64d4792249D68BbA2Fe',
    chainId: 1285,
    decimals: 6,
    logoURI: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=014',
    website: 'https://ripple.com/xrp/',
    description:
      'XRP is a digital asset built for payments. It is the native digital asset on the XRP Ledger—an open-source, permissionless and decentralized blockchain technology that can settle transactions in 3-5 seconds.',
  },
  WAN: {
    name: 'WAN Token',
    symbol: 'WAN',
    address: '0x41562ae242d194247389152aCAa7a9397136b09F',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/wanchain-wan-logo.svg?v=014',
    website: 'https://www.wanchain.org/',
    description:
      'Wanchain is a distributed ledger that allows for cross-chain transactions and the interoperability of multiple chains. Although Wanchain facilitates transactions between blockchains, it is also a stand-alone blockchain that runs autonomously.',
  },
  FINN: {
    name: 'FINN Token',
    symbol: 'FINN',
    address: '0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://www.huckleberry.finance/static/media/02.edc46c96.png',
    website: 'https://www.huckleberry.finance/#/swap',
    description: 'Huckleberry is a community driven AMM crosschain DEX built on Moonriver.',
  },
  DOTm: {
    name: 'Polkadot Token',
    symbol: 'DOTm',
    address: '0x15B9CA9659F5dfF2b7d35a98dd0790a3CBb3D445',
    chainId: 1285,
    decimals: 10,
    logoURI:
      'https://assets.coingecko.com/coins/images/12171/large/aJGBjJFU_400x400.jpg?1597804776',
    website: 'https://polkadot.network/',
    description:
      'Polkadot is an open source, blockchain-based distributed computing platform that enables the blockchains built on top of it, known as "parachains", to execute atomic inter-chain transactions between themselves in a trust-minimized way, thereby creating an interconnected internet of blockchains.',
  },
  USDCm: {
    name: 'USD Coin',
    symbol: 'USDCm',
    address: '0x748134b5F553F2bcBD78c6826De99a70274bDEb3',
    chainId: 1285,
    decimals: 6,
    logoURI:
      'https://app.solarbeam.io/_next/image?url=https%3A%2F%2Fapp.solarbeam.io%2Fimages%2Ftokens%2Fusdc.png&w=48&q=50',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  SOLAR: {
    name: 'SolarBeam Token',
    symbol: 'SOLAR',
    address: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://app.solarbeam.io/_next/image?url=%2Fimages%2Ftokens%2Fsolar.png&w=32&q=50',
    website: 'https://app.solarbeam.io/exchange/swap',
    description:
      'Solarbeam is a decentralized exchange, providing liquidity and enabling peer-to-peer transactions on the Moonriver Network. We are currently the leading DEX on the network. The goal is to provide a comprehensive and convenient, one-stop platform for the cryptocurrency community.',
  },
  RIB: {
    name: 'RiverBoat',
    symbol: 'RIB',
    address: '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E',
    chainId: 1285,
    decimals: 18,
    logoURI:
      'https://app.solarbeam.io/_next/image?url=https%3A%2F%2Fapp.solarbeam.io%2Fimages%2Ftokens%2Frib.png&w=32&q=50',
    website: 'https://seascape.finance/#/swap',
    description:
      'Scapes are Seascapes original series of NFTs. Unlike many of their predecessors, they are designed to be true financial assets. Players can mint, stake, and burn them in exchange for Crowns or other rewards.',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
    chainId: 1285,
    decimals: 6,
    logoURI:
      'https://app.solarbeam.io/_next/image?url=https%3A%2F%2Fapp.solarbeam.io%2Fimages%2Ftokens%2Fusdc.png&w=48&q=50',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',
    chainId: 1285,
    decimals: 18,
    website: 'https://makerdao.com/en/',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a/logo.png',
  },
  BUSD: {
    name: 'Binance-Peg BUSD Token',
    symbol: 'BUSD',
    address: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
    chainId: 1285,
    decimals: 18,
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos). BUSD is approved and regulated by the New York State Department of Financial Services (NYDFS). The BUSD Monthly Audit Report can be viewed from the official website.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/tokens/BUSD/logo.png',
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
    chainId: 1285,
    decimals: 18,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  },
  BNB: {
    name: 'Binance',
    symbol: 'BNB',
    address: '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
    chainId: 1285,
    decimals: 18,
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
    chainId: 1285,
    decimals: 8,
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    chainId: 1285,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
  },
  MATIC: {
    name: 'Matic Token',
    symbol: 'MATIC',
    address: '0x682F81e57EAa716504090C3ECBa8595fB54561D8',
    chainId: 1285,
    decimals: 18,
    website: 'https://polygon.technology/',
    description:
      'The MATIC token serves dual purposes: securing the Polygon network via staking and being used for the payment of transaction fees.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x885ca6663E1E19DAD31c1e08D9958a2b8F538D53/logo.png',
  },
  AVAX: {
    name: 'Avalanche Token',
    symbol: 'AVAX',
    address: '0x14a0243C333A5b238143068dC3A7323Ba4C30ECB',
    chainId: 1285,
    decimals: 18,
    website: 'https://www.avalabs.org/',
    description:
      'Avalanche is the fastest smart contracts platform in the blockchain industry, as measured by time-to-finality, and has the most validators securing its activity of any proof-of-stake protocol.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7/logo.png',
  },
  RELAY: {
    name: 'Relay Token',
    symbol: 'RELAY',
    address: '0xAd7F1844696652ddA7959a49063BfFccafafEfe7',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://www.relaychain.com/static/media/relay-icon.e8d6824b.svg',
    website: 'https://www.relaychain.com/',
    description:
      'Cross-chain token transfers on the worlds top blockchains using Relays fast, secure chain bridge',
  },
  miMatic: {
    name: 'MAI',
    symbol: 'miMatic',
    address: '0x7f5a79576620C046a293F54FFCdbd8f2468174F1',
    chainId: 1285,
    decimals: 18,
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stable coin collateralized by your MATIC holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png',
  },
  FTM: {
    name: 'Fantom Token',
    symbol: 'FTM',
    address: '0xaD12daB5959f30b9fF3c2d6709f53C335dC39908',
    chainId: 1285,
    decimals: 18,
    website:
      'https://fantom.foundation/defi/?__cf_chl_jschl_tk__=pmd_vfkYw1Z8PZor5oxGKrd9bxYd66paY0bLiQmy1dKOLpY-1633331752-0-gqNtZGzNAdCjcnBszQlR',
    description:
      'Fantom offers the first DeFi stack built on an aBFT consensus. It’s much faster, cheaper, and more reliable and secure than its predecessors.',
    logoURI: 'https://repository.fantom.network/logos/sftm.svg',
  },
  MIM: {
    name: 'Magic Internet Money',
    symbol: 'MIM',
    address: '0x0caE51e1032e8461f4806e26332c030E34De3aDb',
    chainId: 1285,
    decimals: 18,
    website: 'https://abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    logoURI: '',
  },
  PETS: {
    name: 'PETS Token',
    symbol: 'PETS',
    address: '0x1e0F2A75Be02c025Bd84177765F89200c04337Da',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://www.polkapet.world/assets/img/landing/logo-1.png',
    website: 'https://www.polkapet.world/',
    description:
      'An immersive NFT collection created in partnership with the biggest and best Polkadot projects',
  },
  SUSHI,
  mSUSHI: {
    ...SUSHI,
    symbol: 'mSUSHI',
  },
  anyFRAX: {
    name: 'FRAX',
    symbol: 'FRAX',
    address: '0x965f84D915a9eFa2dD81b653e3AE736555d945f4',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/frax-frax-logo.svg?v=014',
    website: 'https://frax.finance/',
    description:
      'The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
  },
  FRAX: {
    name: 'FRAX',
    symbol: 'FRAX',
    address: '0x1A93B23281CC1CDE4C4741353F3064709A16197d',
    chainId: 1285,
    decimals: 18,
    logoURI: 'https://cryptologos.cc/logos/frax-frax-logo.svg?v=014',
    website: 'https://frax.finance/',
    description:
      'The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
  },
  aROME: {
    name: 'Alpha Rome',
    symbol: 'aROME',
    address: '0x3D2D044E8C6dAd46b4F7896418d3d4DFaAD902bE',
    chainId: 1285,
    decimals: 9,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x3D2D044E8C6dAd46b4F7896418d3d4DFaAD902bE.svg',
    website: 'https://romedao.finance/',
    description:
      'RomeDAO is a community project with no central team. It’s a community project built by and for the community. This means it’s up to the community contributors to build a prospering Rome.',
  },
  ROME: {
    name: 'Rome',
    symbol: 'ROME',
    address: '0x4a436073552044D5f2f49B176853ad3Ad473d9d6',
    chainId: 1285,
    decimals: 9,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x3D2D044E8C6dAd46b4F7896418d3d4DFaAD902bE.svg',
    website: 'https://romedao.finance/',
    description:
      'RomeDAO is a community project with no central team. It’s a community project built by and for the community. This means it’s up to the community contributors to build a prospering Rome.',
  },
  BNBbsc: {
    name: 'Binance',
    symbol: 'BNBbsc',
    address: '0x868892CCcEdbfF0B028F3b3595205Ea91b99376B',
    chainId: 1285,
    decimals: 18,
    website: 'https://www.binance.com/',
    description: 'BNB from BSC wrapped by passport.meter.io',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c.png',
  },
  WBTCeth: {
    name: 'Wrapped Bitcoin',
    symbol: 'WBTCeth',
    address: '0xE6a991Ffa8CfE62B0bf6BF72959A3d4f11B2E0f5',
    chainId: 1285,
    decimals: 8,
    website: 'https://passport.meter.io/transfer#/ ',
    description: 'WBTC from Etherem wrapped by passport.meter.io',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  xcKSM: {
    name: 'xcKSM',
    symbol: 'xcKSM',
    address: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
    chainId: 1285,
    decimals: 12,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080.svg',
    website: 'https://kusama.network/',
    description:
      'Unprecedented interoperability and scalability for blockchain developers who want to quickly push the limits of what’s possible. Built using Substrate with nearly the same codebase and industry-leading multichain infrastructure as Kusama’s cousin, Polkadot.',
  },
  xcRMRK: {
    name: 'xcRMRK',
    symbol: 'xcRMRK',
    address: '0xffffffFF893264794d9d57E1E0E21E0042aF5A0A',
    chainId: 1285,
    decimals: 10,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xffffffFF893264794d9d57E1E0E21E0042aF5A0A.svg',
    website: 'https://www.rmrk.app/',
    description:
      'ETERNALLY liquid. FORWARD compatible.Nested, conditional, & Multi-resourced NFTs.',
  },
  stKSM: {
    name: 'stKSM',
    symbol: 'stKSM',
    address: '0xFfc7780C34B450d917d557E728f033033CB4fA8C',
    chainId: 1285,
    decimals: 12,
    logoURI:
      'https://github.com/solarbeamio/solarbeam-tokenlist/blob/main/assets/moonriver/0xFfc7780C34B450d917d557E728f033033CB4fA8C/logo.png',
    website: 'https://kusama.lido.fi/',
    description:
      'Lido for Moonriver is a liquid staking solution for KSM backed by industry-leading staking providers.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
