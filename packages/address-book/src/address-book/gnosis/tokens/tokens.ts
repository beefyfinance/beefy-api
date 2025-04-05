import type { Token } from '../../../types/token.js';

const xDAI = {
  name: 'Wrapped xDAI',
  address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  symbol: 'WXDAI',
  oracleId: 'WXDAI',
  decimals: 18,
  chainId: 100,
  website: 'https://www.gnosis.io/',
  description:
    'xDai is the native currency built on the Gnosis blockchain, it is generated when a Dai is sent to the xDai bridge, the bridge validators mint the xDai as part of the Gnosis reward native contract.',
  bridge: 'gnosis-canonical',
  logoURI: '',
  documentation: 'https://docs.gnosischain.com/about/tokens/xdai',
} as const satisfies Token;

export const tokens = {
  xDAI,
  WXDAI: xDAI,
  WNATIVE: xDAI,
  AURA: {
    name: 'Aura',
    symbol: 'AURA',
    oracleId: 'AURA',
    address: '0x1509706a6c66CA549ff0cB464de88231DDBe213B',
    chainId: 100,
    decimals: 18,
    website: 'https://aura.finance/',
    description:
      'Aura Finance is a protocol built on top of the Balancer system to provide maximum incentives to Balancer liquidity providers and BAL stakers (into veBAL) through social aggregation of BAL deposits and Aura’s native token. For BAL stakers, Aura provides a seamless onboarding process to veBAL, by creating a tokenised wrapper token called auraBAL that represents the 80/20 BPT locked up for the maximum time in VotingEscrow (read more about what this means). This can be staked to receive existing rewards (BAL and bbaUSD) from Balancer, in addition to a share of any BAL earned by Aura (read more about the fees), and additional AURA. This minting process is irreversible however users can trade their auraBAL back to BAL through an incentivised liquidity pool.',
    bridge: 'layer-zero',
    logoURI: '',
    documentation: 'https://docs.aura.finance/',
  },
  wstETH: {
    name: 'Lido Wrapped Staked ETH',
    symbol: 'wstETH',
    oracleId: 'wstETH',
    address: '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6',
    chainId: 100,
    decimals: 18,
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    bridge: 'gnosis-canonical',
    logoURI: '',
    documentation: 'https://docs.lido.fi/',
  },
  BAL: {
    name: 'Balancer',
    symbol: 'BAL',
    oracleId: 'BAL',
    address: '0x7eF541E2a22058048904fE5744f9c7E4C57AF717',
    chainId: 100,
    decimals: 18,
    website: 'https://balancer.fi/',
    description:
      'Balancer turns the concept of an index fund on its head: instead of a paying fees to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance your portfolio by following arbitrage opportunities. ',
    logoURI: '',
    documentation: 'https://docs.balancer.fi/',
    bridge: 'gnosis-canonical',
  },
  WETH: {
    name: 'Wrapped Ether',
    address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
    symbol: 'WETH',
    oracleId: 'WETH',
    decimals: 18,
    chainId: 100,
    website: 'https://weth.io/',
    description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
    bridge: 'gnosis-canonical',
    logoURI: 'https://arbiscan.io/token/images/weth_28.png',
    documentation: 'https://ethereum.org/en/developers/docs/',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
    chainId: 100,
    decimals: 6,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'gnosis-canonical',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
    documentation: 'https://tether.to/en/how-it-works',
  },
  USDC: {
    name: 'USD Coin',
    address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    symbol: 'USDC',
    oracleId: 'USDC',
    decimals: 6,
    website: 'https://www.centre.io/',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 100,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
    documentation: 'https://www.circle.com/en/usdc-multichain/arbitrum',
    bridge: 'gnosis-canonical',
  },
  EURe: {
    name: 'Monerium EURe emoney',
    symbol: 'EURe',
    oracleId: 'EURe',
    address: '0xcB444e90D8198415266c6a2724b7900fb12FC56E',
    chainId: 100,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/23354/small/eur.png?1643926562',
    website: 'https://monerium.com/',
    bridge: 'gnosis-canonical',
    documentation: 'https://monerium.dev/',
    description:
      'EURe is a Euro stable-coin from Monerium. Monerium is the first company authorized to issue money on blockchains under European financial regulation. They have issued EUR, USD, GBP, and ISK as e-money tokens on Ethereum and EUR on Algorand. Monerium also operates a gateway for instant transfers of EUR between bank accounts and blockchain wallets/smart contracts.',
  },
  sDAI: {
    name: 'Savings xDAI',
    symbol: 'sDAI',
    oracleId: 'sDAI',
    address: '0xaf204776c7245bF4147c2612BF6e5972Ee483701',
    chainId: 100,
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/23354/small/eur.png?1643926562',
    website: 'https://spark.fi/',
    documentation: 'https://docs.spark.fi/',
    bridge: 'gnosis-canonical',
    description:
      'Savings Dai (sDAI) is an ERC-4626 representation/wrapper of DAI in the Dai Savings Rate (DSR) module. sDAI allows users to deposit DAI to receive the yield generated by the Maker protocol while still being able to transfer, stake, lend and use it in any way you want.',
  },
  GNO: {
    chainId: 100,
    address: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
    decimals: 18,
    name: 'Gnosis Token',
    symbol: 'GNO',
    oracleId: 'GNO',
    website: 'https://www.gnosis.io/',
    documentation: 'https://www.gnosis.io/developers',
    bridge: 'gnosis-canonical',
    description:
      'Gnosis is a community-run chain that is created by nodes run by thousands of ordinary people around the globe. As a distributed network, a diverse set of nodes ensure that the network is resilient to technical failures. A diversity of nodes run across many countries ensures the network can remain credibly neutral infrastructure.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBAA66822055AD37EC05638eC5AAfDC6Ef0e96445/logo.png',
  },
  COW: {
    chainId: 100,
    address: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
    decimals: 18,
    name: 'CoW Protocol',
    symbol: 'COW',
    oracleId: 'COW',
    website: 'https://cow.fi/',
    documentation: 'https://docs.cow.fi/',
    bridge: 'gnosis-canonical',
    description:
      'CoW Protocol finds the lowest price for your trade across all exchanges and aggregators, such as Uniswap and 1inch – and protects you from MEV, unlike the others.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0xBAA66822055AD37EC05638eC5AAfDC6Ef0e96445/logo.png',
  },
  crvUSD: {
    name: 'Curve.Fi USD Stablecoin',
    symbol: 'crvUSD',
    oracleId: 'crvUSD',
    address: '0xaBEf652195F98A91E490f047A5006B71c85f058d',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://crvusd.curve.fi/',
    description:
      'crvUSD is a collateralized-debt-position (CDP) stablecoin pegged to the US Dollar',
    documentation: 'https://docs.curve.fi/crvUSD/crvUSD/',
    bridge: 'gnosis-canonical',
  },
  USDCe: {
    name: 'Bridged USDC (Gnosis)',
    symbol: 'USDCe',
    oracleId: 'USDCe',
    address: '0x2a22f9c3b484c3629090FeED35F17Ff8F88f76F0',
    chainId: 100,
    decimals: 6,
    website: 'https://www.circle.com/en/usdc',
    description:
      'USDC.e on the Gnosis Chain follows the Circle standard. Issued by regulated financial institutions, it is backed by fully reserved assets and is redeemable on a 1:1 basis for US dollars. This version facilitates future bridging via Circle’s Cross-Chain Transfer Protocol (CCTP).',
    logoURI: '',
    documentation:
      'https://docs.gnosischain.com/bridges/About%20Token%20Bridges/omnibridge#usdce-a-usdc-token-on-gnosis-chain-that-complies-with-circle-standard',
    bridge: 'gnosis-canonical',
  },
  EURA: {
    name: 'EURA (previously agEUR)',
    symbol: 'EURA',
    oracleId: 'agEUR',
    address: '0x4b1E2c2762667331Bc91648052F646d1b0d35984',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://app.angle.money/',
    description:
      'EURA (previously agEUR) is pegged to the value of the Euro (€) and is a product of Angle, a decentralized, capital-efficient and over-collateralized stablecoins protocol.',
    bridge: 'layer-zero',
    documentation: 'https://docs.angle.money/',
  },
  stEUR: {
    name: 'Staked EURA',
    symbol: 'stEUR',
    oracleId: 'stEUR',
    address: '0x004626A008B1aCdC4c74ab51644093b155e59A23',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://app.angle.money/',
    description:
      'stEUR is a yield-bearing stablecoin received when depositing EURA into the Angle savings solution, with its value increasing over time due to earned yield. It is an ERC20 token, liquid, and tradeable on decentralized exchanges, allowing automatic yield earnings.',
    bridge: 'layer-zero',
    documentation: 'https://docs.angle.money/',
  },
  rETH: {
    name: 'Rocket Pool ETH from Mainnet',
    symbol: 'rETH',
    oracleId: 'rETH',
    address: '0xc791240D1F2dEf5938E2031364Ff4ed887133C3d',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://rocketpool.net/',
    description:
      'As a Rocket Pool staker, your role is to deposit ETH into the deposit pool which will enable a node operator to create a new Beacon Chain validator. You can stake as little as 0.01 ETH. In doing so, you will be given a token called rETH. rETH represents both how much ETH you deposited, and when you deposited it.',
    bridge: 'gnosis-canonical',
    documentation: 'https://docs.rocketpool.net/guides/',
  },
  agGNO: {
    name: 'Aave GNO',
    symbol: 'agGNO',
    oracleId: 'agGNO',
    address: '0xA1Fa064A85266E2Ca82DEe5C5CcEC84DF445760e',
    chainId: 100,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://aave.com/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description: 'Aave interest bearing GNO.',
  },
  wagGNO: {
    name: 'Wrapped Aave GNO',
    symbol: 'wagGNO',
    oracleId: 'wagGNO',
    address: '0x7c16F0185A26Db0AE7a9377f23BC18ea7ce5d644',
    chainId: 100,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://aave.com/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description: 'Wrapped Aave interest bearing GNO.',
  },
  agwstETH: {
    name: 'Aave wstETH',
    symbol: 'agwstETH',
    oracleId: 'agwstETH',
    address: '0x23e4E76D01B2002BE436CE8d6044b0aA2f68B68a',
    chainId: 100,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://aave.com/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description: 'Aave interest bearing wstETH.',
  },
  wagwstETH: {
    name: 'Wrapped Aave wstETH',
    symbol: 'wagwstETH',
    oracleId: 'wagwstETH',
    address: '0x773CDA0CADe2A3d86E6D4e30699d40bB95174ff2',
    chainId: 100,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://aave.com/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description: 'Wrapped Aave interest bearing wstETH.',
  },
  agETH: {
    name: 'Aave ETH',
    symbol: 'agETH',
    oracleId: 'agETH',
    address: '0xa818F1B57c201E092C4A2017A91815034326Efd1',
    chainId: 100,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://aave.com/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description: 'Aave interest bearing ETH .',
  },
  wagETH: {
    name: 'Wrapped Aave ETH',
    symbol: 'wagETH',
    oracleId: 'wagETH',
    address: '0x57f664882F762FA37903FC864e2B633D384B411A',
    chainId: 100,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://aave.com/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description: 'Wrapped Aave interest bearing ETH.',
  },
  SAFE: {
    name: 'SAFE Token',
    symbol: 'SAFE',
    oracleId: 'SAFE',
    address: '0x4d18815D14fe5c3304e87B3FA18318baa5c23820',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://safe.global/token',
    documentation: 'https://safe.global/blog/safe-tokenomics',
    description:
      'SAFE Token acts as your key to participate in web3’s transition to smart accounts. Token holders tap into a diverse and ever-evolving ecosystem and govern the future of Safe.',
    bridge: 'gnosis-canonical',
  },
  bCSPX: {
    name: 'Backed CSPX Core S&P 500',
    symbol: 'bCSPX',
    oracleId: 'bCSPX',
    address: '0x1e2C4fb7eDE391d116E6B41cD0608260e8801D59',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://assets.backed.fi/products/bcspx',
    documentation: 'https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6751b3cb9df2755163702cde_KID%20bCSPX%20-%20EN.pdf',
    description:
      'The Backed CSPX Core S&P 500 (ticker symbol: bCSPX) is a tracker certificate issued as an ERC-20 token. bCSPX tracks the price of the iShares Core S&P 500 UCITS ETF USD (the underlying). The investment objective of the underlying is to deliver the net total return performance of S&P 500 index, less the fees and expenses of the fund. bCSPX is designed to give eligible cryptocurrency market participants regulatory-compliant access to the S&P 500’s performance, whilst maintaining the benefits of blockchain technology.',
    bridge: 'gnosis-canonical',
  },
  wbTSLA: {
    name: 'Wrapped Backed Tesla Inc',
    symbol: 'wbTSLA',
    oracleId: 'wbTSLA',
    address: '0x1f82284C1658Ad71C576f7230E6C2DEE7901c1FA',
    chainId: 100,
    decimals: 18,
    logoURI: '',
    website: 'https://assets.backed.fi/products/btsla',
    documentation: 'https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6751b142345d4106258dcdc6_KID%20-%20bTSLA%20-%20EN.pdf',
    description:
      'Backed Tesla (bTSLA) is a tracker certificate issued as an ERC-20 token. bTSLA tracks the price of Tesla Inc. (the underlying). bTSLA is designed to give eligible cryptocurrency market participants regulatory-compliant access to the stock price of Tesla Inc.',
  },
} as const satisfies Record<string, Token>;
