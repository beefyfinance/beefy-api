import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether ',
  address: '0x0Dc808adcE2099A9F62AA87D9670745AbA741746',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 169,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  logoURI: 'https://arbiscan.io/token/images/weth_28.png',
  documentation: 'https://ethereum.org/en/developers/docs/',
} as const satisfies Token;

export const tokens = {
  ETH,
  WETH: ETH,
  WNATIVE: ETH,
  STONE: {
    name: 'StakeStone Ether',
    symbol: 'STONE',
    oracleId: 'STONE',
    address: '0xEc901DA9c68E90798BbBb74c11406A32A70652C3',
    chainId: 169,
    decimals: 18,
    logoURI: '',
    website: 'https://stakestone.io/',
    documentation: 'https://docs.stakestone.io/stakestone',
    description:
      'StakeStone is an omni-chain LST (Liquid Staking Token) protocol aiming to bring native staking yields and liquidity to Layer 2s in a decentralized manner.',
    bridge: 'layer-zero',
    risks: ['NO_TIMELOCK'],
  },
  USDC: {
    name: 'USDC',
    symbol: 'USDC',
    oracleId: 'USDC',
    address: '0xb73603C5d87fA094B7314C74ACE2e64D165016fb',
    chainId: 169,
    decimals: 6,
    logoURI: '',
    website: 'https://www.circle.com/usdc',
    documentation: 'https://developers.circle.com/docs',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
    bridge: 'manta-canonical',
  },
  USDT: {
    name: 'USDT',
    symbol: 'USDT',
    oracleId: 'USDT',
    address: '0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f',
    chainId: 169,
    decimals: 6,
    logoURI: '',
    website: 'https://tether.to/',
    documentation: 'https://tether.to/en/how-it-works',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    bridge: 'manta-canonical',
  },
  MANTA: {
    name: 'MANTA',
    symbol: 'MANTA',
    oracleId: 'MANTA',
    address: '0x95CeF13441Be50d20cA4558CC0a27B601aC544E5',
    chainId: 169,
    decimals: 18,
    logoURI: '',
    website: 'https://pacific.manta.network/',
    documentation: 'https://mantanetwork.medium.com/manta-tokenomics-b226f911c84c',
    description:
      'MANTA is the network gas token of Manta Atlantic and also benefits from the sequencer revenue of Manta Pacific. Holders can also vote in governance proposals of both chains.',
    bridge: 'manta-canonical',
  },
} as const satisfies Record<string, Token>;
