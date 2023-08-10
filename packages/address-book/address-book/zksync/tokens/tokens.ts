import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
  symbol: 'WETH',
  decimals: 18,
  chainId: 324,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'zksync-canonical',
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x44AA3eEDD3214Ddd02E8b3FE1E8AE4cAC452a2E0',
    chainId: 324,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    documentation: 'https://docs.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  VS: {
    name: 'veSync',
    symbol: 'VS',
    address: '0x5756A28E2aAe01F600FC2C01358395F5C1f8ad3A',
    chainId: 324,
    decimals: 18,
    logoURI: '',
    website: 'https://app.vesync.finance/swap',
    description:
      'veSync is a community-driven, ve(3,3) Decentralized Exchange (DEX) built on the zkSync network, providing a powerful and efficient platform for DeFi liquidity.',
    documentation: 'https://docs.vesync.finance/',
  },
  wTBT: {
    name: 'wTBT Pool',
    symbol: 'wTBT',
    address: '0xd90764041DA2720396863836E9f78dDaee140533',
    chainId: 324,
    decimals: 18,
    logoURI: '',
    website: 'https://www.tprotocol.io/',
    description:
      'The launch of TProtocol will drastically alter the current DeFi picture and add an important missing piece, making DeFi users able to benefit from the mid-term interest rate gap between the stables and rising treasury. TProtocol will provide permissionless interest bearing tokens backed by the treasury with short duration. The redemption price of this treasury token will increase over time as interest from treasury accrues into the tokens.',
    bridge: 'zksync-canonical',
    documentation:
      'https://tprotocol.gitbook.io/tprotocol-documentation/white-paper/tprotocol-documentation',
  },
  VC: {
    name: 'Velocore',
    symbol: 'VC',
    address: '0x85D84c774CF8e9fF85342684b0E795Df72A24908',
    chainId: 324,
    decimals: 18,
    logoURI: '',
    website: 'https://app.velocore.xyz/swap',
    description:
      'Velocore is a key DeFi component of the zkSync era ecosystem, designed to reward users for providing liquidity. Built upon the strong foundation established by Solidly and Velodrome Finance, Velocore aims to foster growth and innovation within zkSync era. As part of our grand vision, we plan to expand Velocores capabilities by launching a lending market and supporting other builders. This strategic development will enable us to build powerful money legos on zkSync era, further enhancing the DeFi landscape.',
    bridge: 'native',
    documentation: 'https://docs.velocore.xyz/',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    chainId: 324,
    decimals: 6,
    logoURI: '',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'zksync-canonical',
  },
  BUSD: {
    name: 'Binance USD',
    symbol: 'BUSD',
    address: '0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181',
    chainId: 324,
    decimals: 18,
    logoURI: '',
    website: 'https://www.binance.com/en/busd',
    description:
      'Binance USD (BUSD) is a 1:1 USD-backed stable coin issued by Binance (in partnership with Paxos), Approved and regulated by the New York State Department of Financial Services (NYDFS), The BUSD Monthly Audit Report can be viewed from the official website.',
    bridge: 'zksync-canonical',
    documentation: '',
  },
  'USD+': {
    name: 'USD+',
    symbol: 'USD+',
    address: '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557',
    chainId: 324,
    decimals: 6,
    logoURI: '',
    website: 'https://overnight.fi/',
    description:
      'USD+ is USDC that pays you yield daily via rebase. It is 100% collateralized with assets immediately convertible into USDC. Yield is generated via strategies such as lending and stable-to-stable pools. Initial strategies include Aave, Rubicon, and Pika.',
    documentation: 'https://docs.overnight.fi/',
  },
  WBTC: {
    name: 'Wrapped BTC',
    symbol: 'WBTC',
    address: '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011',
    chainId: 324,
    decimals: 8,
    logoURI: '',
    website: 'https://wbtc.network/',
    description:
      'Wrapped Bitcoin (WBTC) is the first ERC20 token backed 1:1 with Bitcoin. Completely transparent. 100% verifiable. Community led.',
    bridge: 'zksync-canonical',
  },
  FANG: {
    name: 'Dracula',
    symbol: 'FANG',
    address: '0x160e07e42ADbC1FCE92D505B579Bcd8a3fBEa77d',
    chainId: 324,
    decimals: 18,
    logoURI: '',
    website: 'https://draculafi.xyz/',
    description:
      'DraculaFi is a cutting-edge DeFi protocol built on zkSync Era with a proven ve(3,3) model and game-changing mechanisms that aim to provide increased rewards and stability for users.',
    documentation: 'https://draculafi.gitbook.io/draculafi/',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
