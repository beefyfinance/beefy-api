import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const CELO = {
  name: 'CELO',
  address: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  symbol: 'CELO',
  decimals: 18,
  chainId: 42220,
  website: 'https://celo.org/',
  description:
    'Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone',
  logoURI:
    'https://res.cloudinary.com/dnz2bkszg/image/fetch/f_auto/https://raw.githubusercontent.com/sushiswap/icons/master/token/one.jpg',
} as const;

const WCELO = {
  ...CELO,
  symbol: 'WCELO',
};

const SUSHIV1 = {
  name: 'Sushi Swap',
  symbol: 'SUSHI',
  address: '0xD15EC721C2A896512Ad29C671997DD68f9593226',
  chainId: 42220,
  decimals: 18,
  website: 'https://sushi.com/',
  description:
    'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
  logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
};

const _tokens = {
  CELO,
  WCELO: WCELO,
  WNATIVE: WCELO,
  BIFI: {
    chainId: 42220,
    address: '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
    decimals: 18,
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  cUSD: {
    name: 'Celo Dollar',
    symbol: 'cUSD',
    address: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    chainId: 42220,
    decimals: 18,
    logoURI:
      'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48/https://raw.githubusercontent.com/sushiswap/logos/main/network/celo/0x765DE816845861e75A25fCA122bb6898B8B1282a.jpg',
    website: 'https://celo.org/dapps',
    description: 'Celo Pegged Dollar',
  },
  cEUR: {
    name: 'Celo Euro',
    symbol: 'cEUR',
    address: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    chainId: 42220,
    decimals: 18,
    logoURI:
      'https://res.cloudinary.com/sushi-cdn/image/fetch/w_48/https://raw.githubusercontent.com/sushiswap/logos/main/network/celo/0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73.jpg',
    website: 'https://celo.org/dapps',
    description: 'Celo Pegged Euro',
  },
  WETHV1: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    address: '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
    chainId: 42220,
    decimals: 18,
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xf20d962a6c8f70c731bd838a3a388D7d48fA6e15/logo.png',
  },
  WETH: {
    name: 'Wrapped Ether',
    symbol: 'WETH',
    address: '0x122013fd7dF1C6F636a5bb8f03108E876548b455',
    chainId: 42220,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x122013fd7dF1C6F636a5bb8f03108E876548b455.svg',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  DAIV1: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0xE4fE50cdD716522A56204352f00AA110F731932d',
    chainId: 42220,
    decimals: 18,
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3.png',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0xE4fE50cdD716522A56204352f00AA110F731932d',
    chainId: 42220,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xE4fE50cdD716522A56204352f00AA110F731932d.svg',
    website: 'https://makerdao.com/en/',
    description:
      'DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.',
  },
  SUSHIV2: {
    name: 'Sushi Swap',
    symbol: 'SUSHI',
    address: '0x29dFce9c22003A4999930382Fd00f9Fd6133Acd1',
    chainId: 42220,
    decimals: 18,
    website: 'https://sushi.com/',
    description:
      'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
    logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xef4229c8c3250C675F21BCefa42f58EfbfF6002a',
    chainId: 42220,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xef4229c8c3250C675F21BCefa42f58EfbfF6002a.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0',
    chainId: 42220,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  MOBI: {
    name: 'Mobius DAO Token',
    symbol: 'MOBI',
    address: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B',
    chainId: 42220,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B.svg',
    website: 'https://www.mobius.money/#/swap',
    description: 'A cross-chain stableswap DEX on Celo',
  },
  SUSHIV1,
  cSUSHI: {
    ...SUSHIV1,
    symbol: 'cSUSHI',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
