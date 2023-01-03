import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  symbol: 'WETH',
  decimals: 18,
  chainId: 1,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain. ',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x5870700f1272a1AdbB87C3140bD770880a95e55D',
    chainId: 1,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    documentation: 'https://docs.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  USDC: {
    name: 'USD Coin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    chainId: 1,
    logoURI: 'https://ftmscan.com/token/images/USDC_32.png',
    documentation: 'https://developers.circle.com/docs',
  },
  wstETH: {
    name: 'Lido Wrapped Staked ETH',
    symbol: 'wstETH',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    chainId: 1,
    decimals: 18,
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    logoURI: '',
    documentation: 'https://docs.lido.fi/',
  },
  stETH: {
    name: 'Lido Wrapped Staked ETH',
    symbol: 'stETH',
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    chainId: 1,
    decimals: 18,
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    logoURI: '',
    documentation: 'https://docs.lido.fi/',
  },
  pETH: {
    name: "JPEG'd ETH",
    symbol: 'pETH',
    address: '0x836A808d4828586A69364065A1e064609F5078c7',
    chainId: 1,
    decimals: 18,
    website: 'https://jpegd.io/',
    description:
      "pETH is an Ethereum derivative supported by the JPEG'd protocol. It is minted when a user borrows against their NFT and burned when they decide to repay their loan. Unlike the 2% interest rate for borrowing PUSd, minting $pETH against an NFT has a 5% interest rate.",
    documentation: 'https://docs.jpegd.io/tokenomics/usdpeth',
  },
  FRAX: {
    chainId: 1,
    address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    decimals: 18,
    name: 'Frax',
    symbol: 'FRAX',
    website: 'https://frax.finance/',
    description: 'Frax is the first fractional-algorithmic stablecoin protocol.',
    logoURI:
      'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64/logo.png',
    documentation: 'https://docs.frax.finance/',
  },
  WBTC: {
    chainId: 1,
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  sBTC: {
    chainId: 1,
    address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
    decimals: 18,
    name: 'Synthetix: sBTC',
    symbol: 'sBTC',
    website: 'https://www.synthetix.io/',
    description:
      'sBTC is a synthetic Bitcoin token enabled by the Synthetix protocol. It tracks the price of Bitcoin through price feeds supplied by Chainlink’s decentralized network of oracles.',
    logoURI:
      'https://raw.githubusercontent.com/ava-labs/bridge-tokens/main/avalanche-tokens/0x408D4cD0ADb7ceBd1F1A1C33A0Ba2098E1295bAB/logo.png',
  },
  multiBTC: {
    chainId: 1,
    address: '0x66eFF5221ca926636224650Fd3B9c497FF828F7D',
    decimals: 8,
    name: 'Multichain BTC',
    symbol: 'multiBTC',
    website: 'https://app.multichain.org/',
    description: 'Multichain supports to swap BTC to MultiBTC (Multichain BTC) 1:1.',
  },
  alETH: {
    name: 'Alchemix ETH',
    symbol: 'alETH',
    address: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://alchemix.fi/',
    documentation: 'https://alchemix-finance.gitbook.io/v2/',
    description:
      'Alchemix Self-Repaying Loans allow you to leverage a range of tokens without risk of liquidation.',
  },
  MIM: {
    name: 'Magic Internet Money',
    address: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
    symbol: 'MIM',
    decimals: 18,
    chainId: 1,
    website: 'https://abracadabra.money/',
    description:
      'You, the Spellcaster, can provide collateral in the form of various interest bearing crypto assets such as yvYFI, yvUSDT, yvUSDC, xSUSHI and more. With this, you can borrow magic internet money (MIM) which is a stable coin that you can swap for any other traditional stable coin.',
    logoURI: '',
    documentation: 'https://docs.abracadabra.money/',
  },
  ApeUSD: {
    name: 'ApeUSD',
    address: '0xfF709449528B6fB6b88f557F7d93dEce33bca78D',
    symbol: 'ApeUSD',
    decimals: 18,
    chainId: 1,
    website: 'https://ape.fi/',
    documentation: 'https://github.com/ape-fi/ape-finance',
    description:
      'Ape Finance is building DeFi tools for metaverse dwellers, proud PFP owners, and digital collectible enthusiasts in all of us. We appreciate culture, art, and games. Ape Finance begins with the creation of the ApeUSD.',
    logoURI: '',
  },
  auraBAL: {
    name: 'Aura Staked BAL BPT',
    symbol: 'auraBAL',
    address: '0x616e8BfA43F920657B3497DBf40D6b1A02D4608d',
    chainId: 1,
    decimals: 18,
    website: 'https://aura.finance/',
    description: "auraBAL is Aura's liquid staking locked BAL (80 BAL / 20 ETH) BPT",
    logoURI: '',
    documentation: 'https://docs.aura.finance/aura/what-is-aura/for-usdbal-stakers',
  },
  BAL: {
    name: 'Balancer',
    symbol: 'BAL',
    address: '0xba100000625a3754423978a60c9317c58a424e3D',
    chainId: 1,
    decimals: 18,
    website: 'https://balancer.fi/',
    description:
      'Balancer turns the concept of an index fund on its head: instead of a paying fees to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance your portfolio by following arbitrage opportunities. ',
    logoURI: '',
    documentation: 'https://docs.balancer.fi/',
  },
  AURA: {
    name: 'Aura',
    symbol: 'AURA',
    address: '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF',
    chainId: 1,
    decimals: 18,
    website: 'https://aura.finance/',
    description:
      'Aura Finance is a protocol built on top of the Balancer system to provide maximum incentives to Balancer liquidity providers and BAL stakers (into veBAL) through social aggregation of BAL deposits and Aura’s native token. For BAL stakers, Aura provides a seamless onboarding process to veBAL, by creating a tokenised wrapper token called auraBAL that represents the 80/20 BPT locked up for the maximum time in VotingEscrow (read more about what this means). This can be staked to receive existing rewards (BAL and bbaUSD) from Balancer, in addition to a share of any BAL earned by Aura (read more about the fees), and additional AURA. This minting process is irreversible however users can trade their auraBAL back to BAL through an incentivised liquidity pool.',
    logoURI: '',
    documentation: 'https://docs.aura.finance/',
  },
  MAI: {
    name: 'Mai Stablecoin',
    symbol: 'MAI',
    address: '0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://mai.finance/',
    documentation: 'https://docs.mai.finance/',
    description:
      'MAI is a stable coin collateralized by your MATIC holdings. Its powered by Qi Dao, a protocol that enables any cryptocurrency community to create stablecoins backed by their native tokens.',
  },
  CRV: {
    name: 'CRV',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    symbol: 'CRV',
    decimals: 18,
    chainId: 1,
    website: 'https://curve.fi/',
    description:
      'Curve is an exchange liquidity pool on Ethereum. Curve is designed for extremely efficient stablecoin trading and low risk, supplemental fee income for liquidity providers, without an opportunity cost.',
    logoURI: '',
    documentation: 'https://curve.readthedocs.io/',
  },
  CVX: {
    name: 'CVX',
    address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    symbol: 'CVX',
    decimals: 18,
    chainId: 1,
    website: 'https://www.convexfinance.com/',
    documentation: 'https://docs.convexfinance.com/',
    description:
      'Convex allows Curve.fi liquidity providers to earn trading fees and claim boosted CRV without locking CRV themselves. Liquidity providers can receive boosted CRV and liquidity mining rewards with minimal effort.',
    logoURI: '',
  },
  cvxCRV: {
    name: 'cvxCRV',
    address: '0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7',
    symbol: 'cvxCRV',
    decimals: 18,
    chainId: 1,
    website: 'https://www.convexfinance.com/',
    documentation: 'https://docs.convexfinance.com/',
    description:
      'Convex allows Curve.fi liquidity providers to earn trading fees and claim boosted CRV without locking CRV themselves. Liquidity providers can receive boosted CRV and liquidity mining rewards with minimal effort.',
    logoURI: '',
  },
  cvxFXS: {
    name: 'cvxFXS',
    address: '0xFEEf77d3f69374f66429C91d732A244f074bdf74',
    symbol: 'cvxFXS',
    decimals: 18,
    chainId: 1,
    website: 'https://frax.convexfinance.com/',
    documentation: 'https://docs.convexfinance.com/',
    description:
      'Convex Finance has expanded to optimize opportunities for liquidity providers on Frax the same way it has done so for Curve.fi LPs.',
    logoURI: '',
  },
  sethUSDC: {
    name: 'Stargate USD Coin LP',
    symbol: 'sethUSDC',
    address: '0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xef4229c8c3250C675F21BCefa42f58EfbfF6002a.svg',
    website: 'https://stargate.finance/',
    description:
      'Stargate allows users and dApps to bridge native tokens with instant guaranteed finality. USDC is deposited in a LP pool to enable high liquidity for bridging.',
    documentation: 'https://stargateprotocol.gitbook.io/stargate/v/user-docs/',
  },
  sethUSDT: {
    name: 'Stargate Tether USD LP',
    symbol: 'sethUSDT',
    address: '0x38EA452219524Bb87e18dE1C24D3bB59510BD783',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    description:
      'Stargate allows users and dApps to bridge native tokens with instant guaranteed finality. USDT is deposited in a LP pool to enable high liquidity for bridging.',
    documentation: 'https://stargateprotocol.gitbook.io/stargate/v/user-docs/',
  },
  rETH: {
    name: 'Rocket Pool ETH',
    symbol: 'rETH',
    address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    chainId: 1,
    decimals: 18,
    website: 'https://rocketpool.net/',
    description:
      'As a Rocket Pool staker, your role is to deposit ETH into the deposit pool which will enable a node operator to create a new Beacon Chain validator. You can stake as little as 0.01 ETH. In doing so, you will be given a token called rETH. rETH represents both how much ETH you deposited, and when you deposited it.',
    logoURI: '',
    documentation: 'https://docs.rocketpool.net/guides/',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    documentation: 'https://tether.to/en/how-it-works',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  DOLA: {
    name: 'Dola USD Stablecoin',
    symbol: 'DOLA',
    address: '0x865377367054516e17014CcdED1e7d814EDC9ce4',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://www.inverse.finance/',
    documentation: 'https://docs.inverse.finance/inverse-finance/using-dola/how-to-acquire-dola',
    description:
      'Inverse.finance is a suite of permissionless decentralized finance tools governed by Inverse DAO, a decentralized autonomous organization running on the Ethereum blockchain.',
  },
  sETH: {
    name: 'Synth sETH',
    symbol: 'sETH',
    address: '0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://synthetix.io/',
    description:
      'Synths are derivative tokens providing exposure to a range of assets. They can be traded with infinite liquidity and zero slippage by leveraging the Synthetix protocol’s unique pooled collateral model. Trades between Synths generate a small fee that is distributed to SNX collateral providers.',
  },
  cbETH: {
    name: 'Coinbase Wrapped Staked ETH',
    symbol: 'cbETH',
    address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://help.coinbase.com/en/coinbase/trading-and-funding/staking-rewards/cbeth',
    description:
      "Coinbase Wrapped Staked ETH (“cbETH”) is a utility token that represents Ethereum 2 (ETH2), which is ETH staked through Coinbase. Over time, the price of cbETH will likely deviate from ETH because cbETH represents 1 staked ETH plus all of its accrued staking interest starting from when cbETH's conversion rate and balance were initialized (June 16, 2022 19:34 UTC). cbETH is minted exclusively by Coinbase.",
  },
  USDD: {
    name: 'Decentralized USD',
    symbol: 'USDD',
    address: '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://usdd.io/',
    description:
      'The USDD protocol aims to provide the blockchain industry with the most stable, decentralized, tamper-proof, and freeze-free stablecoin system, a perpetual system independent from any centralized entity.',
  },
  aUSDT: {
    name: 'Aave Tether USD',
    symbol: 'aUSDT',
    address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    description:
      'Aave interest bearing USDT. Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
  },
  sethETH: {
    name: 'Stargate Ethereum LP',
    symbol: 'sethETH',
    address: '0x101816545F6bd2b1076434B54383a1E633390A2E',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x2170ed0880ac9a755fd29b2688956bd959f933f8.png',
    website: 'https://stargate.finance/',
    description:
      'Stargate allows users and dApps to bridge native tokens with instant guaranteed finality. ETH is deposited in a LP pool to enable high liquidity for bridging.',
    documentation: 'https://stargateprotocol.gitbook.io/stargate/v/user-docs/',
  },
  waUSDT: {
    name: 'Wrapped Aave Tether USD',
    symbol: 'waUSDT',
    address: '0xf8Fd466F12e236f4c96F7Cce6c79EAdB819abF58',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://tether.to/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description:
      'Wrapped Aave interest bearing USDT. Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  bbaUSDT: {
    name: 'Balancer Aave USDT Linear Pool',
    symbol: 'bbaUSDT',
    address: '0x2F4eb100552ef93840d5aDC30560E5513DFfFACb',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://app.balancer.fi/#/',
    documentation: 'https://docs.balancer.fi/products/balancer-pools/boosted-pools',
    description:
      'Balancer linear pool that consist of 50/50 USDT and wrapped Aave Interest Bearing USDT.',
  },
  aUSDC: {
    name: 'Aave USDC',
    symbol: 'aUSDC',
    address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description:
      'Aave interest bearing USDC. USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  waUSDC: {
    name: 'Wrapped Aave Tether USD',
    symbol: 'waUSDC',
    address: '0xd093fA4Fb80D09bB30817FDcd442d4d02eD3E5de',
    chainId: 1,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description:
      'Wrapped Aave interest bearing USDC. USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  bbaUSDC: {
    name: 'Balancer Aave USDC Linear Pool',
    symbol: 'bbaUSDC',
    address: '0x82698aeCc9E28e9Bb27608Bd52cF57f704BD1B83',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://app.balancer.fi/#/',
    documentation: 'https://docs.balancer.fi/products/balancer-pools/boosted-pools',
    description:
      'Balancer linear pool that consist of 50/50 USDC and wrapped Aave Interest Bearing USDC.',
  },
  DAI: {
    name: 'DAI Stablecoin',
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chainId: 1,
    decimals: 18,
    logoURI: '',
    website: 'https://makerdao.com/en/',
    documentation:
      'https://docs.makerdao.com/smart-contract-modules/dai-module/dai-detailed-documentation',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
  },
  aDAI: {
    name: 'Aave DAI',
    symbol: 'aDAI',
    address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://makerdao.com/en/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description:
      'Aave interest bearing DAI. Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain.',
  },
  waDAI: {
    name: 'Wrapped Aave Tether DAI',
    symbol: 'waDAI',
    address: '0x02d60b84491589974263d922D9cC7a3152618Ef6',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://makerdao.com/en/',
    documentation: 'https://docs.aave.com/developers/v/2.0/the-core-protocol/atokens',
    description:
      'Wrapped Aave interest bearing DAI. Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain.',
  },
  bbaDAI: {
    name: 'Balancer Aave DAI Linear Pool',
    symbol: 'bbaDAI',
    address: '0xae37D54Ae477268B9997d4161B96b8200755935c',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://app.balancer.fi/#/',
    documentation: 'https://docs.balancer.fi/products/balancer-pools/boosted-pools',
    description:
      'Balancer linear pool that consist of 50/50 DAI and wrapped Aave Interest Bearing DAI.',
  },
  bbaUSD: {
    name: 'Balancer Aave Stable Composable Pool',
    symbol: 'bbaUSD',
    address: '0xA13a9247ea42D743238089903570127DdA72fE44',
    chainId: 1,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x4988a896b1227218e4A686fdE5EabdcAbd91571f.svg',
    website: 'https://app.balancer.fi/#/',
    documentation: 'https://docs.balancer.fi/products/balancer-pools/boosted-pools',
    description:
      'Balancer composable pool that consist of bbaUSDT, bbaUSDC, and bbaDAI. bbTokens are Aave boosted linear pools.',
  },
  frxETH: {
    name: 'Frax Ether',
    symbol: 'frxETH',
    address: '0x5E8422345238F34275888049021821E8E08CAa1f',
    chainId: 1,
    decimals: 18,
    website: 'https://app.frax.finance/frxeth/mint',
    description:
      'frxETH acts as a stablecoin loosely pegged to ETH, so that 1 frxETH always represents 1 ETH and the amount of frxETH in circulation matches the amount of ETH in the Frax ETH system. When ETH is sent to the frxETHMinter, an equivalent amount of frxETH is minted. Holding frxETH on its own is not eligible for staking yield and should be thought of as analogous as holding ETH.',
    logoURI: '',
    documentation: 'https://docs.frax.finance/frax-ether/frxeth-and-sfrxeth',
  },
  sfrxETH: {
    name: 'Staked Frax Ether',
    symbol: 'sfrxETH',
    address: '0xac3E018457B222d93114458476f3E3416Abbe38F',
    chainId: 1,
    decimals: 18,
    website: 'https://app.frax.finance/frxeth/mint',
    description:
      'sfrxETH is a ERC-4626 vault designed to accrue the staking yield of the Frax ETH validators. At any time, frxETH can be exchanged for sfrxETH by depositing it into the sfrxETH vault, which allows users to earn staking yield on their frxETH. Over time, as validators accrue staking yield, an equivalent amount of frxETH is minted and added to the vault, allowing users to redeem their sfrxETH for an greater amount of frxETH than they deposited. ',
    logoURI: '',
    documentation: 'https://docs.frax.finance/frax-ether/frxeth-and-sfrxeth',
  },
  INV: {
    name: 'Inverse Finance',
    symbol: 'INV',
    address: '0x41D5D79431A913C4aE7d69a668ecdfE5fF9DFB68',
    chainId: 1,
    decimals: 18,
    website: 'https://www.inverse.finance/',
    documentation: 'https://docs.inverse.finance/inverse-finance/about-inverse',
    description:
      'Inverse.finance is a suite of permissionless decentralized finance tools governed by Inverse DAO, a decentralized autonomous organization running on the Ethereum blockchain.',
    logoURI: 'https://assets.spookyswap.finance/tokens/INV.png',
  },
  ACX: {
    name: 'Across Protocol Token',
    symbol: 'ACX',
    address: '0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F',
    chainId: 1,
    decimals: 18,
    website: 'https://across.to/',
    documentation: 'https://docs.across.to/',
    description:
      'Across is a cross-chain bridge for L2s and rollups secured by UMAs optimistic oracle. It is optimized for capital efficiency with a single liquidity pool, a competitive relayer landscape, and a no-slippage fee model.',
    logoURI: '',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
