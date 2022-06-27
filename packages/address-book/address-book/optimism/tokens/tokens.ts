import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4200000000000000000000000000000000000006',
  symbol: 'WETH',
  decimals: 18,
  chainId: 10,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: '',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BEETS: {
    name: 'Beethoven X Token',
    symbol: 'BEETS',
    address: '0x97513e975a7fA9072c72C92d8000B0dB90b163c5',
    chainId: 10,
    decimals: 18,
    website: 'https://beethovenx.io/',
    description:
      'BEETS is the governance token for the Beethoven X protocol. Built on Balancer V2, Beethoven X is the first next-generation AMM protocol on Fantom.',
    logoURI:
      'https://assets.coingecko.com/coins/images/19158/small/beets-icon-large.png?1634545465',
  },
  OP: {
    name: 'Optimism Token',
    symbol: 'OP',
    address: '0x4200000000000000000000000000000000000042',
    chainId: 10,
    decimals: 18,
    website: 'https://app.optimism.io/governance',
    description:
      'Optimistic Rollup is a layer 2 scaling solution that scales both transaction throughput and computation on Ethereum. The backbone of our implementation is the Optimistic Virtual Machine (OVM), which is fully compatible with the EVM.',
    logoURI: '',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    chainId: 10,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xef4229c8c3250C675F21BCefa42f58EfbfF6002a.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  sUSD: {
    name: 'Synth sUSD',
    symbol: 'sUSD',
    address: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
    chainId: 10,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xef4229c8c3250C675F21BCefa42f58EfbfF6002a.svg',
    website: 'https://www.synthetix.io/',
    description:
      'sUSD is a synthetic USD token enabled by the Synthetix protocol. It tracks the price of the US Dollar through price feeds supplied by Chainlink’s decentralized network of oracles',
  },
  WBTC: {
    chainId: 10,
    address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  LYRA: {
    chainId: 10,
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    decimals: 18,
    name: 'Lyra Token',
    symbol: 'LYRA',
    website: 'https://www.lyra.finance/',
    description:
      'Lyra’s decentralized exchange is the easiest place to buy and sell options on cryptocurrencies.',
    logoURI: '',
  },
  QI: {
    chainId: 10,
    address: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
    decimals: 18,
    name: 'Qi Dao',
    symbol: 'QI',
    website: 'https://www.mai.finance/',
    description:
      'Qi (pronounced CHEE) is the governance token of the QiDao Protocol. It allows those who hold it to vote on changes to the QiDao Protocol.',
    logoURI: '',
  },
  SNX: {
    name: 'Synthetix',
    symbol: 'SNX',
    address: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
    chainId: 10,
    decimals: 18,
    website: 'https://www.synthetix.io/',
    description:
      'Synthetix is the backbone for derivatives trading in DeFi, allowing anyone, anywhere to gain on-chain exposure to a vast range of assets.',
    logoURI: 'https://hecoinfo.com/token/images/snx_32.png',
  },
  PERP: {
    name: 'Perpetual Protocol',
    symbol: 'PERP',
    address: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
    chainId: 10,
    decimals: 18,
    website: 'https://app.perp.com/',
    description: 'Cross margin DeFi trading with up to 10×-leverage.',
    logoURI: '',
  },
  BAL: {
    name: 'Balancer',
    symbol: 'BAL',
    address: '0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921',
    chainId: 10,
    decimals: 18,
    website: 'https://balancer.fi/',
    description:
      'Balancer turns the concept of an index fund on its head: instead of a paying fees to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance your portfolio by following arbitrage opportunities.',
    logoURI: 'https://hecoinfo.com/token/images/bal_32.png',
  },
  MAI: {
    chainId: 10,
    address: '0xdFA46478F9e5EA86d57387849598dbFB2e964b02',
    decimals: 18,
    name: 'Mai Stablecoin',
    symbol: 'MAI',
    website: 'https://www.mai.finance/',
    description:
      "MAI is a stable coin collateralized by your MATIC holdings. It's powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.",
    logoURI: 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png',
  },
  FRAX: {
    name: 'Frax',
    address: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
    symbol: 'FRAX',
    decimals: 18,
    chainId: 10,
    website: 'https://frax.finance/',
    description:
      'The Frax Protocol introduced the world to the concept of a cryptocurrency being partially backed by collateral and partially stabilized algorithmically.',
    logoURI: 'https://avatars.githubusercontent.com/u/56005256?s=200&v=4',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
