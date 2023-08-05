import { Chain } from 'viem/chains';
import {
  ARBITRUM_RPC,
  AURORA_RPC,
  AVAX_RPC,
  BSC_RPC,
  CANTO_RPC,
  CELO_RPC,
  CRONOS_RPC,
  EMERALD_RPC,
  ETH_RPC,
  FANTOM_RPC,
  FUSE_RPC,
  HECO_RPC,
  KAVA_RPC,
  METIS_RPC,
  MOONBEAM_RPC,
  MOONRIVER_RPC,
  ONE_RPC,
  OPTIMISM_RPC,
  POLYGON_RPC,
  ZKEVM_RPC,
  ZKSYNC_RPC,
  BASE_RPC,
} from '../../constants';
import { ChainId } from '../../../packages/address-book/address-book';

const avalancheChain = {
  id: 43_114,
  name: 'Avalanche',
  network: 'avalanche',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    public: { http: [AVAX_RPC] },
    default: { http: [AVAX_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain;

const bscChain = {
  id: 56,
  name: 'BNBChain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BSC',
  },
  rpcUrls: {
    public: { http: [BSC_RPC] },
    default: { http: [BSC_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: 'https://bscscan.com' },
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 15_921_452,
    },
  },
} as const satisfies Chain;

const polygonChain = {
  id: 137,
  name: 'Poylgon',
  network: 'polygon',
  nativeCurrency: {
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: [POLYGON_RPC] },
    default: { http: [POLYGON_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'PolygonScan', url: 'https://polygonscan.com' },
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25_770_160,
    },
  },
} as const satisfies Chain;

const fantomChain = {
  id: 250,
  name: 'Fantom',
  network: 'fantom',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    public: { http: [FANTOM_RPC] },
    default: { http: [FANTOM_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'BscScan', url: 'https://bscscan.com' },
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 33_001_987,
    },
  },
} as const satisfies Chain;

const harmonyChain = {
  id: 1666600000,
  name: 'Harmony',
  network: 'harmony',
  nativeCurrency: {
    decimals: 18,
    name: 'Harmony',
    symbol: 'ONE',
  },
  rpcUrls: {
    public: { http: [ONE_RPC] },
    default: { http: [ONE_RPC] },
  },
  blockExplorers: {
    default: { name: 'Harmony Explorer', url: 'https://explorer.harmony.one' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 24_185_753,
    },
  },
} as const satisfies Chain;

const arbitrumChain = {
  id: 42161,
  name: 'Arbitrum',
  network: 'arbitrum',
  nativeCurrency: {
    decimals: 18,
    name: 'Arbitrum',
    symbol: 'ARB',
  },
  rpcUrls: {
    public: { http: [ARBITRUM_RPC] },
    default: { http: [ARBITRUM_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'Arbitrum Explorer', url: 'https://arbiscan.io' },
    default: { name: 'Arbitrum Explorer', url: 'https://arbiscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 24_185_753,
    },
  },
} as const satisfies Chain;

const celoChain = {
  id: 42220,
  name: 'Celo',
  network: 'celo',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo',
    symbol: 'CELO',
  },
  rpcUrls: {
    public: { http: [CELO_RPC] },
    default: { http: [CELO_RPC] },
  },
  blockExplorers: {
    default: { name: 'Celo Explorer', url: 'https://explorer.celo.org' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 13_112_599,
    },
  },
} as const satisfies Chain;

//Moonriver chain object
const moonriverChain = {
  id: 1285,
  name: 'Moonriver',
  network: 'moonriver',
  nativeCurrency: {
    decimals: 18,
    name: 'Moonriver',
    symbol: 'MOVR',
  },
  rpcUrls: {
    public: { http: [MOONRIVER_RPC] },
    default: { http: [MOONRIVER_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'Moonriver Explorer', url: 'https://moonriver.subscan.io' },
    default: { name: 'Moonriver Explorer', url: 'https://moonriver.subscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1_597_904,
    },
  },
} as const satisfies Chain;

const moonbeamChain = {
  id: 1284,
  name: 'Moonbeam',
  network: 'moonbeam',
  nativeCurrency: {
    decimals: 18,
    name: 'Moonbeam',
    symbol: 'GLMR',
  },
  rpcUrls: {
    public: { http: [MOONBEAM_RPC] },
    default: { http: [MOONBEAM_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'Moonbeam Explorer', url: 'https://moonbeam-explorer.netlify.app' },
    default: { name: 'Moonbeam Explorer', url: 'https://moonbeam-explorer.netlify.app' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 609_002,
    },
  },
} as const satisfies Chain;

const cronosChain = {
  id: 25,
  name: 'Cronos',
  network: 'cronos',
  nativeCurrency: {
    decimals: 18,
    name: 'Cronos',
    symbol: 'CRO',
  },
  rpcUrls: {
    public: { http: [CRONOS_RPC] },
    default: { http: [CRONOS_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'CronosScan', url: 'https://cronoscan.com' },
    default: { name: 'CronosScan', url: 'https://cronoscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1_963_112,
    },
  },
} as const satisfies Chain;

const auroraChain = {
  id: 1313161554,
  name: 'Aurora',
  network: 'aurora',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [AURORA_RPC],
    },
    public: {
      http: [AURORA_RPC],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Aurorascan',
      url: 'https://aurorascan.dev',
    },
    default: {
      name: 'Aurorascan',
      url: 'https://aurorascan.dev',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 62_907_816,
    },
  },
} as const satisfies Chain;

const fuseChain = {
  id: 122,
  name: 'Fuse',
  network: 'fuse',
  nativeCurrency: {
    decimals: 18,
    name: 'Fuse',
    symbol: 'FUSE',
  },
  rpcUrls: {
    public: { http: [FUSE_RPC] },
    default: { http: [FUSE_RPC] },
  },
  blockExplorers: {
    default: { name: 'FuseScan', url: 'https://explorer.fuse.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 16_146_628,
    },
  },
} as const satisfies Chain;

const metisChain = {
  id: 1088,
  name: 'Metis',
  network: 'metis',
  nativeCurrency: {
    decimals: 18,
    name: 'Metis',
    symbol: 'METIS',
  },
  rpcUrls: {
    public: { http: [METIS_RPC] },
    default: { http: [METIS_RPC] },
  },
  blockExplorers: {
    default: { name: 'Metis Explorer', url: 'https://explorer.metis.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2_338_552,
    },
  },
} as const satisfies Chain;

const emeraldChain = {
  id: 42262,
  name: 'Emerald',
  network: 'emerald',
  nativeCurrency: {
    decimals: 18,
    name: 'Rose',
    symbol: 'ROSE',
  },
  rpcUrls: {
    public: { http: [EMERALD_RPC] },
    default: { http: [EMERALD_RPC] },
  },
  blockExplorers: {
    default: { name: 'Emerald Explorer', url: 'https://explorer.emerald.oasis.dev/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1_481_392,
    },
  },
} as const satisfies Chain;

const optimismChain = {
  id: 10,
  name: 'Optimism',
  network: 'optimism',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [OPTIMISM_RPC] },
    default: { http: [OPTIMISM_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'Optimistic Explorer', url: 'https://optimistic.etherscan.io' },
    default: { name: 'Optimistic Explorer', url: 'https://optimistic.etherscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4_286_263,
    },
  },
} as const satisfies Chain;

const kavaChain = {
  id: 2222,
  name: 'Kava',
  network: 'kava',
  nativeCurrency: {
    decimals: 18,
    name: 'Kava',
    symbol: 'KAVA',
  },
  rpcUrls: {
    public: { http: [KAVA_RPC] },
    default: { http: [KAVA_RPC] },
  },
  blockExplorers: {
    default: { name: 'Kava Explorer', url: 'https://explorer.kava.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3_661_165,
    },
  },
} as const satisfies Chain;

const ethereumChain = {
  id: 1,
  name: 'Ethereum',
  network: 'ethereum',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [ETH_RPC] },
    default: { http: [ETH_RPC] },
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: 'https://etherscan.io' },
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14_353_601,
    },
  },
} as const satisfies Chain;

const cantoChain = {
  id: 7700,
  name: 'Canto',
  network: 'canto',
  nativeCurrency: {
    decimals: 18,
    name: 'Canto',
    symbol: 'CANTO',
  },
  rpcUrls: {
    public: { http: [CANTO_RPC] },
    default: { http: [CANTO_RPC] },
  },
  blockExplorers: {
    default: { name: 'Canto Explorer', url: 'https://cantoscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
} as const satisfies Chain;

const zkSyncChain = {
  id: 324,
  name: 'zkSync',
  network: 'zksync',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [ZKSYNC_RPC] },
    default: { http: [ZKSYNC_RPC] },
  },
  blockExplorers: {
    default: { name: 'Canto Explorer', url: 'https://cantoscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0x9A04a9e1d67151AB1E742E6D8965e0602410f91d',
      blockCreated: 0,
    },
  },
} as const satisfies Chain;

const hecoChain = {
  id: 128,
  name: 'Heco',
  network: 'heco',
  nativeCurrency: {
    decimals: 18,
    name: 'Heco',
    symbol: 'HT',
  },
  rpcUrls: {
    public: { http: [HECO_RPC] },
    default: { http: [HECO_RPC] },
  },
  blockExplorers: {
    default: { name: 'Heco Explorer', url: 'https://hecoinfo.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const zkEvmChain = {
  id: 1101,
  name: 'zkEvm',
  network: 'zkevm',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [ZKEVM_RPC] },
    default: { http: [ZKEVM_RPC] },
  },
  blockExplorers: {
    default: { name: 'zkEvm Explorer', url: 'https://zkevm.polygonscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const baseChain = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: [BASE_RPC] },
    default: { http: [BASE_RPC] },
  },
  blockExplorers: {
    default: { name: 'Base Explorer', url: 'https://basescan.org/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

//build a map from chainId to chain object
export const getChain: Partial<Record<ChainId, Chain>> = {
  [ChainId.avax]: avalancheChain,
  [ChainId.bsc]: bscChain,
  [ChainId.polygon]: polygonChain,
  [ChainId.fantom]: fantomChain,
  [ChainId.one]: harmonyChain,
  [ChainId.arbitrum]: arbitrumChain,
  [ChainId.celo]: celoChain,
  [ChainId.moonriver]: moonriverChain,
  [ChainId.moonbeam]: moonbeamChain,
  [ChainId.cronos]: cronosChain,
  [ChainId.aurora]: auroraChain,
  [ChainId.fuse]: fuseChain,
  [ChainId.metis]: metisChain,
  [ChainId.emerald]: emeraldChain,
  [ChainId.optimism]: optimismChain,
  [ChainId.kava]: kavaChain,
  [ChainId.ethereum]: ethereumChain,
  [ChainId.canto]: cantoChain,
  [ChainId.zksync]: zkSyncChain,
  [ChainId.heco]: hecoChain,
  [ChainId.zkevm]: zkEvmChain,
  [ChainId.base]: baseChain,
} as const;
