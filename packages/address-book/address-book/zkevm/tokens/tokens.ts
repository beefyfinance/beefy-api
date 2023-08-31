import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
  symbol: 'WETH',
  decimals: 18,
  chainId: 1101,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'polygon-zkevm',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035',
    chainId: 1101,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035.svg',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'zkevm-canonical',
  },
  MATIC: {
    name: 'Matic Token',
    symbol: 'MATIC',
    address: '0xa2036f0538221a77A3937F1379699f44945018d0',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xa2036f0538221a77A3937F1379699f44945018d0.svg',
    website: 'https://polygon.technology/',
    description:
      'Polygon is a protocol and a framework for building and connecting Ethereum-compatible blockchain networks. Aggregating scalable solutions on Ethereum supporting a multi-chain Ethereum ecosystem.',
    documentation: 'https://zkevm.polygon.technology/',
    bridge: 'zkevm-canonical',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1',
    chainId: 1101,
    decimals: 8,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xEA034fb02eB1808C2cc3adbC15f447B93CbE08e1.svg',
    website: 'https://wbtc.network/',
    documentation: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    bridge: 'zkevm-canonical',
  },
  USDT: {
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d',
    chainId: 1101,
    decimals: 6,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x1E4a5963aBFD975d8c9021ce480b42188849D41d.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    documentation: 'https://tether.to/en/how-it-works',
    bridge: 'zkevm-canonical',
  },
  DAI: {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    address: '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4.svg',
    website: 'https://makerdao.com/en/',
    description:
      'Dai is a stablecoin cryptocurrency which aims to keep its value as close to one United States dollar as possible through an automated system of smart contracts on the Ethereum blockchain',
    documentation: 'https://docs.makerdao.com/',
    bridge: 'zkevm-canonical',
  },
  stMATIC: {
    name: 'Staked MATIC',
    symbol: 'stMATIC',
    address: '0x83b874c1e09D316059d929da402dcB1A98e92082',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x83b874c1e09D316059d929da402dcB1A98e92082.svg',
    website: 'https://polygon.lido.fi/',
    description:
      'Lido for Polygon is a liquid staking solution for MATIC backed by industry-leading staking providers.',
    documentation: 'https://docs.lido.fi/',
    bridge: 'zkevm-canonical',
  },
  QUICK: {
    name: 'QuickSwap',
    symbol: 'QUICK',
    address: '0x68286607A1d43602d880D349187c3c48c0fD05E6',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0x68286607A1d43602d880D349187c3c48c0fD05E6.svg',
    website: 'https://quickswap.exchange/#/swap',
    description: 'Next-gen Layer 2 DEX. Trade at lightning-fast speeds with near-zero gas fees.',
    documentation: 'https://docs.quickswap.exchange/',
    bridge: 'zkevm-canonical',
  },
  FRAX: {
    name: 'Frax',
    symbol: 'FRAX',
    address: '0xFf8544feD5379D9ffa8D47a74cE6b91e632AC44D',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xFf8544feD5379D9ffa8D47a74cE6b91e632AC44D.svg',
    website: 'https://frax.finance/',
    description: 'Frax is the first fractional-algorithmic stablecoin protocol.',
    documentation: 'https://docs.frax.finance/',
    bridge: 'frax',
  },
  frxETH: {
    name: 'Frax Ether',
    symbol: 'frxETH',
    address: '0xCf7eceE185f19e2E970a301eE37F93536ed66179',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xCf7eceE185f19e2E970a301eE37F93536ed66179.svg',
    website: 'https://app.frax.finance/frxeth/mint',
    description:
      'frxETH acts as a stablecoin loosely pegged to ETH, so that 1 frxETH always represents 1 ETH and the amount of frxETH in circulation matches the amount of ETH in the Frax ETH system. When ETH is sent to the frxETHMinter, an equivalent amount of frxETH is minted. Holding frxETH on its own is not eligible for staking yield and should be thought of as analogous as holding ETH.',
    documentation: 'https://docs.frax.finance/frax-ether/frxeth-and-sfrxeth',
    bridge: 'frax',
  },
  BAL: {
    name: 'Balancer',
    symbol: 'BAL',
    address: '0x120eF59b80774F02211563834d8E3b72cb1649d6',
    chainId: 1101,
    decimals: 18,
    logoURI:
      'https://tokens.pancakeswap.finance/images/0xCf7eceE185f19e2E970a301eE37F93536ed66179.svg',
    website: 'https://balancer.fi/',
    description:
      'Balancer turns the concept of an index fund on its head: instead of a paying fees to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance your portfolio by following arbitrage opportunities. ',
    documentation: 'https://docs.balancer.fi/',
    bridge: 'zkevm-canonical',
  },
  wstETH: {
    name: 'Lido Wrapped Staked ETH',
    symbol: 'wstETH',
    address: '0x5D8cfF95D7A57c0BF50B30b43c7CC0D52825D4a9',
    chainId: 1101,
    decimals: 18,
    website: 'https://lido.fi/',
    description:
      'Lido is a liquid staking solution for ETH backed by industry-leading staking providers. Lido lets users stake their ETH - without locking assets or maintaining infrastructure - whilst participating in on-chain activities, e.g. lending. Lido attempts to solve the problems associated with initial ETH staking - illiquidity, immovability and accessibility - making staked ETH liquid and allowing for participation with any amount of ETH to improve security of the Ethereum network.',
    logoURI: '',
    documentation: 'https://docs.lido.fi/',
    bridge: 'zkevm-canonical',
  },
  rETH: {
    name: 'Rocket Pool ETH',
    symbol: 'rETH',
    address: '0xb23C20EFcE6e24Acca0Cef9B7B7aA196b84EC942',
    chainId: 1101,
    decimals: 18,
    website: 'https://rocketpool.net/',
    description:
      'As a Rocket Pool staker, your role is to deposit ETH into the deposit pool which will enable a node operator to create a new Beacon Chain validator. You can stake as little as 0.01 ETH. In doing so, you will be given a token called rETH. rETH represents both how much ETH you deposited, and when you deposited it.',
    logoURI: '',
    documentation: 'https://docs.rocketpool.net/guides/',
    bridge: 'zkevm-canonical',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
