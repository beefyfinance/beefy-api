import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const KAVA = {
  name: 'Wrapped KAVA',
  address: '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',
  symbol: 'WKAVA',
  decimals: 18,
  chainId: 2222,
  website: 'https://www.kava.io/',
  description:
    'The Kava Network is the first Layer-1 blockchain to combine the speed and scalability of the Cosmos SDK with the developer support of Ethereum. The Kava Network will empower developers to build for Web3 and next-gen blockchain technologies through its unique co-chain architecture. KAVA is the native governance and staking token of the Kava Network, enabling its decentralization and security. ',
  logoURI: '',
  documentation: 'https://docs.kava.io/docs/intro/',
} as const;

const _tokens = {
  KAVA,
  WKAVA: KAVA,
  WNATIVE: KAVA,
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    chainId: 2222,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xB12BFcA5A55806AaF64E99521918A4bf0fC40802.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC (Multichain) is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    documentation: 'https://developers.circle.com/docs',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    address: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
    chainId: 2222,
    decimals: 6,
    website: 'https://tether.to/',
    documentation: 'https://tether.to/en/how-it-works',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
  },
  DAI: {
    name: 'Dai Stablecoin',
    address: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    symbol: 'DAI',
    decimals: 18,
    chainId: 2222,
    website: 'https://makerdao.com/',
    documentation: 'https://docs.makerdao.com/',
    description:
      'Multi-Collateral Dai, brings a lot of new and exciting features, such as support for new CDP collateral types and Dai Savings Rate.',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  SUSHI: {
    name: 'Sushi',
    address: '0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D',
    symbol: 'SUSHI',
    decimals: 18,
    chainId: 2222,
    website: 'https://sushi.com/',
    description:
      'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
    logoURI: 'https://app.sushi.com/static/media/logo.11fafaa5.png',
  },
  WBTC: {
    name: 'Wrapped BTC',
    address: '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
    symbol: 'WBTC',
    decimals: 8,
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    chainId: 2222,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  },
  ETH: {
    name: 'Ether',
    address: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
    symbol: 'ETH',
    decimals: 18,
    chainId: 2222,
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  axlUSDC: {
    name: 'Axelar USD Coin ',
    symbol: 'axlUSDC',
    address: '0xEB466342C4d449BC9f53A865D5Cb90586f405215',
    chainId: 2222,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xB12BFcA5A55806AaF64E99521918A4bf0fC40802.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC (Axelar) is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    documentation: 'https://docs.axelar.dev/',
  },
  axlUSDT: {
    name: 'USDT',
    symbol: 'axlUSDT',
    address: '0x7f5373AE26c3E8FfC4c77b7255DF7eC1A9aF52a6',
    chainId: 2222,
    decimals: 6,
    website: 'https://tether.to/',
    documentation: 'https://docs.axelar.dev/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
  },
  axlDAI: {
    name: 'Axelar Dai Stablecoin',
    address: '0x5C7e299CF531eb66f2A1dF637d37AbB78e6200C7',
    symbol: 'axlDAI',
    decimals: 18,
    chainId: 2222,
    website: 'https://makerdao.com/',
    documentation: 'https://docs.axelar.dev/',
    description:
      'Multi-Collateral Dai, brings a lot of new and exciting features, such as support for new CDP collateral types and Dai Savings Rate.',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
  },
  VARA: {
    name: 'VARA',
    address: '0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73',
    symbol: 'VARA',
    decimals: 18,
    chainId: 2222,
    website: 'https://equilibrefinance.com//',
    documentation: 'https://equilibre-finance.gitbook.io/equilibre-finance/about-us/welcome',
    description:
      'Équilibre is an ve(3.3) AMM (Automatic Market Maker) based on Velodrome, and designed to provide large liquidity & low swapping fees.',
    logoURI:
      'https://raw.githubusercontent.com/equilibre-finance/token-images/blob/main/assets/VARA.png',
  },
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327',
    chainId: 2222,
    decimals: 18,
    website: 'https://beefy.com',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
    documentation: 'https://docs.beefy.finance/',
  },
  MAI: {
    name: 'Mai Stablecoin',
    symbol: 'MAI',
    address: '0xb84Df10966a5D7e1ab46D9276F55d57bD336AFC7',
    chainId: 2222,
    decimals: 18,
    logoURI: '',
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stablecoin collateralized by your crypto holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    documentation: 'https://docs.mai.finance/',
  },
  BNB: {
    name: 'Binance Chain',
    symbol: 'BNB',
    address: '0xABd380327Fe66724FFDa91A87c772FB8D00bE488',
    chainId: 2222,
    decimals: 18,
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
    logoURI: '',
  },
  USX: {
    name: 'dForce USD',
    symbol: 'USX',
    address: '0xDb0E1e86B01c4ad25241b1843E407Efc4D615248',
    chainId: 2222,
    decimals: 18,
    logoURI: '',
    website: 'https://dforce.network/',
    description:
      'USX is the most important DeFi primitive within dForce’s protocol matrix, starting off with an over-collateralization design, where supported assets can be used as collaterals to mint USX within the respective approved LTV ratio (similar to DAI).',
    documentation: 'https://docs.dforce.network/protocols/usx',
  },
  axlATOM: {
    name: 'Axelar Wrapped ATOM',
    symbol: 'axlATOM',
    address: '0x06beE9E7238a331B68D83Df3B5B9B16d5DBa83ff',
    chainId: 2222,
    decimals: 6,
    logoURI: '',
    website: 'https://cosmos.network/',
    description:
      'The Internet of Blockchains. Cosmos is an ever-expanding ecosystem of interconnected apps and services, built for a decentralized future.',
  },
  MARE: {
    name: 'Mare Finance',
    symbol: 'MARE',
    address: '0xd86C8d4279CCaFbec840c782BcC50D201f277419',
    chainId: 2222,
    decimals: 18,
    logoURI: '',
    website: 'https://mare.finance/',
    description:
      'Mare Finance is an EVM compatible lending/borrowing protocol that launched on Kava EVM. Mare Finance provides peer-to-peer lending solutions that are fully decentralized, transparent and non-custodial.',
    documentation: 'https://docs.mare.finance/',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
