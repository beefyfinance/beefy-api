import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  symbol: 'WETH',
  decimals: 18,
  chainId: 42161,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE',
    chainId: 42161,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  USDC: {
    name: 'USD Coin',
    address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 42161,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
  },
  SUSHI: {
    name: 'Sushi',
    address: '0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
    symbol: 'SUSHI',
    decimals: 18,
    chainId: 42161,
    website: 'https://sushi.com/',
    description:
      'Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.',
    logoURI: 'https://ftmscan.com/token/images/sushiswap_32.png',
  },
  NYAN: {
    name: 'ArbiNYAN',
    address: '0xeD3fB761414DA74b74F33e5c5a1f78104b188DfC',
    symbol: 'NYAN',
    decimals: 18,
    chainId: 42161,
    website: 'https://arbinyan.com/',
    description:
      'ArbiNYAN is a fun cat token. The first fair launched token on Arbitrum with 95% of the supply distributed via farming rewards',
    logoURI: 'https://icons.llama.fi/arbinyan.jpg',
  },
  MIM: {
    name: 'albracabra',
    address: '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
    symbol: 'MIM',
    decimals: 18,
    chainId: 42161,
    website: 'https://abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    logoURI: '',
  },
  SPELL: {
    name: 'albracabra',
    address: '0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF',
    symbol: 'SPELL',
    decimals: 18,
    chainId: 42161,
    website: 'https://abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    logoURI: '',
  },
  WBTC: {
    chainId: 42161,
    address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  LINK: {
    name: 'Chainlink',
    symbol: 'LINK',
    address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
    chainId: 42161,
    decimals: 18,
    website: 'https://chain.link/',
    description:
      'Link is the currency used to pay the Chainlink node operators for their work. Chainlink node operators have to stake LINK in the network in order to participate and provide data services.',
    logoURI: 'https://hecoinfo.com/token/images/chainlink_32.png',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    chainId: 42161,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
  },
  gOHM: {
    name: 'Governance OHM',
    symbol: 'gOHM',
    address: '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
    chainId: 42161,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1.svg',
    website: 'https://www.olympusdao.finance/',
    description:
      'Olympus is building a community-owned decentralized financial infrastructure to bring more stability and transparency for the world.',
  },
  MAGIC: {
    name: 'MAGIC',
    symbol: 'MAGIC',
    address: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
    chainId: 42161,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x539bdE0d7Dbd336b79148AA742883198BBF60342.svg',
    website: 'https://www.treasure.lol/',
    description:
      'Treasure bridges the growing network of metaverses through an open and composable approach to the convergence of NFTs, DeFi and Gaming. Cross-ecosystem ties are bolstered through our interrelated resource model. $MAGIC (Power), Treasures (NFT | Resources) and Legions (NFT | Players)',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
