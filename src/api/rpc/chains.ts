import { Chain } from 'viem/chains';
import { getRpcsForChain } from '../../constants';
import { ChainId } from '../../../packages/address-book/src/address-book';

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
    public: { http: getRpcsForChain('avax') },
    default: { http: getRpcsForChain('avax') },
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
    public: { http: getRpcsForChain('bsc') },
    default: { http: getRpcsForChain('bsc') },
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
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: {
    decimals: 18,
    name: 'Pol',
    symbol: 'POL',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('polygon') },
    default: { http: getRpcsForChain('polygon') },
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
    public: { http: getRpcsForChain('fantom') },
    default: { http: getRpcsForChain('fantom') },
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
    public: { http: getRpcsForChain('one') },
    default: { http: getRpcsForChain('one') },
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
    public: { http: getRpcsForChain('arbitrum') },
    default: { http: getRpcsForChain('arbitrum') },
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
    public: { http: getRpcsForChain('celo') },
    default: { http: getRpcsForChain('celo') },
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
    public: { http: getRpcsForChain('moonriver') },
    default: { http: getRpcsForChain('moonriver') },
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
    public: { http: getRpcsForChain('moonbeam') },
    default: { http: getRpcsForChain('moonbeam') },
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
    public: { http: getRpcsForChain('cronos') },
    default: { http: getRpcsForChain('cronos') },
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
      http: getRpcsForChain('aurora'),
    },
    public: {
      http: getRpcsForChain('aurora'),
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
    public: { http: getRpcsForChain('fuse') },
    default: { http: getRpcsForChain('fuse') },
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
    public: { http: getRpcsForChain('metis') },
    default: { http: getRpcsForChain('metis') },
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
    public: { http: getRpcsForChain('emerald') },
    default: { http: getRpcsForChain('emerald') },
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
    public: { http: getRpcsForChain('optimism') },
    default: { http: getRpcsForChain('optimism') },
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
    public: { http: getRpcsForChain('kava') },
    default: { http: getRpcsForChain('kava') },
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
    public: { http: getRpcsForChain('ethereum') },
    default: { http: getRpcsForChain('ethereum') },
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
    public: { http: getRpcsForChain('canto') },
    default: { http: getRpcsForChain('canto') },
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
    public: { http: getRpcsForChain('zksync') },
    default: { http: getRpcsForChain('zksync') },
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
    public: { http: getRpcsForChain('heco') },
    default: { http: getRpcsForChain('heco') },
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
    public: { http: getRpcsForChain('zkevm') },
    default: { http: getRpcsForChain('zkevm') },
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
    public: { http: getRpcsForChain('base') },
    default: { http: getRpcsForChain('base') },
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

const gnosisChain = {
  id: 100,
  name: 'Gnosis',
  network: 'gnosis',
  nativeCurrency: {
    decimals: 18,
    name: 'xDAI',
    symbol: 'xDAI',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('gnosis') },
    default: { http: getRpcsForChain('gnosis') },
  },
  blockExplorers: {
    default: { name: 'Gnosis Explorer', url: 'https://gnosisscan.io/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const lineaChain = {
  id: 59144,
  name: 'Linea',
  network: 'linea',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('linea') },
    default: { http: getRpcsForChain('linea') },
  },
  blockExplorers: {
    default: { name: 'Linea Explorer', url: 'https://explorer.linea.build/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const mantleChain = {
  id: 5000,
  name: 'Mantle',
  network: 'mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'MNT',
    symbol: 'MNT',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('mantle') },
    default: { http: getRpcsForChain('mantle') },
  },
  blockExplorers: {
    default: { name: 'Mantle Explorer', url: 'https://mantlescan.info/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const fraxtalChain = {
  id: 252,
  name: 'Fraxtal',
  network: 'fraxtal',
  nativeCurrency: {
    decimals: 18,
    name: 'Frax',
    symbol: 'FRAX',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('fraxtal') },
    default: { http: getRpcsForChain('fraxtal') },
  },
  blockExplorers: {
    default: { name: 'Fraxtal Explorer', url: 'https://fraxscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const modeChain = {
  id: 34443,
  name: 'Mode',
  network: 'mode',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('mode') },
    default: { http: getRpcsForChain('mode') },
  },
  blockExplorers: {
    default: { name: 'Mode Explorer', url: 'https://explorer.mode.network/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const mantaChain = {
  id: 169,
  name: 'Manta',
  network: 'manta',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('manta') },
    default: { http: getRpcsForChain('manta') },
  },
  blockExplorers: {
    default: { name: 'Manta Pacific Explorer', url: 'https://pacific-explorer.manta.network/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const realChain = {
  id: 111188,
  name: 'Re.Al',
  network: 're.al',
  nativeCurrency: {
    decimals: 18,
    name: 'WREETH',
    symbol: 'WREETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('real') },
    default: { http: getRpcsForChain('real') },
  },
  blockExplorers: {
    default: { name: 're.al explorer', url: 'https://explorer.re.al/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const seiChain = {
  id: 1329,
  name: 'Sei',
  network: 'sei',
  nativeCurrency: {
    decimals: 18,
    name: 'WSEI',
    symbol: 'WSEI',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('sei') },
    default: { http: getRpcsForChain('sei') },
  },
  blockExplorers: {
    default: { name: 'sei explorer', url: 'https://seitrace.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const rootstockChain = {
  id: 30,
  name: 'Rootstock',
  network: 'rootstock',
  nativeCurrency: {
    decimals: 18,
    name: 'WRBTC',
    symbol: 'WRBTC',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('rootstock') },
    default: { http: getRpcsForChain('rootstock') },
  },
  blockExplorers: {
    default: { name: 'rootstock explorer', url: 'https://rootstock.blockscout.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

/// New Chains

const hyperevmChain = {
  id: 999,
  name: 'Hyperevm',
  network: 'hyperevm',
  nativeCurrency: {
    decimals: 18,
    name: 'WHYPE',
    symbol: 'WHYPE',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('hyperevm') },
    default: { http: getRpcsForChain('hyperevm') },
  },
  blockExplorers: {
    default: { name: 'hyperevm explorer', url: 'https://www.hyperscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const sagaChain = {
  id: 5464,
  name: 'Saga',
  network: 'saga',
  nativeCurrency: {
    decimals: 18,
    name: 'GAS',
    symbol: 'GAS',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('saga') },
    default: { http: getRpcsForChain('saga') },
  },
  blockExplorers: {
    default: { name: 'saga explorer', url: 'https://sagaevm-5464-1.sagaexplorer.io/' },
  },
  contracts: {
    multicall3: {
      address: '0x864DDc9B50B9A0dF676d826c9B9EDe9F8913a160',
    },
  },
} as const satisfies Chain;

const berachainChain = {
  id: 80094,
  name: 'Bera',
  network: 'berachain',
  nativeCurrency: {
    decimals: 18,
    name: 'WBERACHAIN',
    symbol: 'WBERACHAIN',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('berachain') },
    default: { http: getRpcsForChain('berachain') },
  },
  blockExplorers: {
    default: { name: 'berachain explorer', url: 'https://berachainscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const sonicChain = {
  id: 146,
  name: 'Sonic',
  network: 'sonic',
  nativeCurrency: {
    decimals: 18,
    name: 'WS',
    symbol: 'WS',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('sonic') },
    default: { http: getRpcsForChain('sonic') },
  },
  blockExplorers: {
    default: { name: 'sonic explorer', url: 'https://sonicscan.org/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const liskChain = {
  id: 1135,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: {
    decimals: 18,
    name: 'WETH',
    symbol: 'WETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('lisk') },
    default: { http: getRpcsForChain('lisk') },
  },
  blockExplorers: {
    default: { name: 'lisk explorer', url: 'https://blockscout.lisk.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const scrollChain = {
  id: 534352,
  name: 'Scroll',
  network: 'scroll',
  nativeCurrency: {
    decimals: 18,
    name: 'WETH',
    symbol: 'WETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('scroll') },
    default: { http: getRpcsForChain('scroll') },
  },
  blockExplorers: {
    default: { name: 'scroll explorer', url: 'https://scrollscan.com/' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
} as const satisfies Chain;

const unichainChain = {
  id: 130,
  name: 'Unichain',
  network: 'unichain',
  nativeCurrency: {
    decimals: 18,
    name: 'WETH',
    symbol: 'WETH',
  },
  rpcUrls: {
    public: { http: getRpcsForChain('unichain') },
    default: { http: getRpcsForChain('unichain') },
  },
  blockExplorers: {
    default: { name: 'unichain explorer', url: 'https://uniscan.xyz' },
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
  [ChainId.gnosis]: gnosisChain,
  [ChainId.linea]: lineaChain,
  [ChainId.mantle]: mantleChain,
  [ChainId.fraxtal]: fraxtalChain,
  [ChainId.mode]: modeChain,
  [ChainId.manta]: mantaChain,
  [ChainId.real]: realChain,
  [ChainId.sei]: seiChain,
  [ChainId.rootstock]: rootstockChain,
  [ChainId.scroll]: scrollChain,
  [ChainId.lisk]: liskChain,
  [ChainId.sonic]: sonicChain,
  [ChainId.berachain]: berachainChain,
  [ChainId.unichain]: unichainChain,
  [ChainId.saga]: sagaChain,
  [ChainId.hyperevm]: hyperevmChain,
} as const;
