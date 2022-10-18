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
    'The Kava Network is the first Layer-1 blockchain to combine the speed and scalability of the Cosmos SDK with the developer support of Ethereum. The Kava Network will empower developers to build for Web3 and next-gen blockchain technologies through its unique co-chain architecture. KAVA is the native governance and staking token of the Kava Network, enabling its decentralization and security.',
  logoURI: '',
  documentation: 'https://docs.kava.io/docs/intro/',
} as const;

const _tokens = {
  KAVA,
  WKAVA: KAVA,
  WNATIVE: KAVA,
  USDC: {
    name: 'USD Coin ',
    symbol: 'USDC',
    address: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    chainId: 2222,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xB12BFcA5A55806AaF64E99521918A4bf0fC40802.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
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
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
