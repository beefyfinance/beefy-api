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
  logoURI: '',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const;

const _tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
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
    documentation: '',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
