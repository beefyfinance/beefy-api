import { platform } from 'os';
import Web3 from 'web3';
import { addressBookByChainId, ChainId } from '../../packages/address-book/address-book';
import { BeefyFinance } from '../../packages/address-book/types/beefyfinance';

import {
  BSC_RPC_ENDPOINTS,
  HECO_RPC,
  AVAX_RPC,
  POLYGON_RPC,
  FANTOM_RPC,
  ONE_RPC,
  BSC_CHAIN_ID,
  HECO_CHAIN_ID,
  AVAX_CHAIN_ID,
  POLYGON_CHAIN_ID,
  FANTOM_CHAIN_ID,
  ONE_CHAIN_ID,
  ARBITRUM_RPC,
  ARBITRUM_CHAIN_ID,
  CELO_RPC,
  CELO_CHAIN_ID,
  MOONRIVER_RPC,
  MOONRIVER_CHAIN_ID,
  CRONOS_RPC,
  CRONOS_CHAIN_ID,
  AURORA_RPC,
  AURORA_CHAIN_ID,
  FUSE_RPC,
  FUSE_CHAIN_ID,
  METIS_RPC,
  METIS_CHAIN_ID,
  MOONBEAM_RPC,
  MOONBEAM_CHAIN_ID,
  EMERALD_RPC,
  EMERALD_CHAIN_ID,
  OPTIMISM_RPC,
  OPTIMISM_CHAIN_ID,
  KAVA_RPC,
  KAVA_CHAIN_ID,
  ETH_RPC,
  ETH_CHAIN_ID,
  CANTO_RPC,
  CANTO_CHAIN_ID,
  ZKSYNC_RPC,
  ZKSYNC_CHAIN_ID,
  ZKEVM_RPC,
  ZKEVM_CHAIN_ID,
  BASE_RPC,
  BASE_CHAIN_ID,
  GNOSIS_RPC,
  GNOSIS_CHAIN_ID,
  LINEA_RPC,
  LINEA_CHAIN_ID,
  MANTLE_RPC,
  MANTLE_CHAIN_ID,
} from '../constants';

const MULTICALLS: Record<ChainId, Pick<BeefyFinance, 'multicall'>['multicall']> = {
  [ChainId.bsc]: addressBookByChainId[ChainId.bsc].platforms.beefyfinance.multicall,
  [ChainId.heco]: addressBookByChainId[ChainId.heco].platforms.beefyfinance.multicall,
  [ChainId.polygon]: addressBookByChainId[ChainId.polygon].platforms.beefyfinance.multicall,
  [ChainId.fantom]: addressBookByChainId[ChainId.fantom].platforms.beefyfinance.multicall,
  [ChainId.avax]: addressBookByChainId[ChainId.avax].platforms.beefyfinance.multicall,
  [ChainId.one]: addressBookByChainId[ChainId.one].platforms.beefyfinance.multicall,
  [ChainId.arbitrum]: addressBookByChainId[ChainId.arbitrum].platforms.beefyfinance.multicall,
  [ChainId.celo]: addressBookByChainId[ChainId.celo].platforms.beefyfinance.multicall,
  [ChainId.moonriver]: addressBookByChainId[ChainId.moonriver].platforms.beefyfinance.multicall,
  [ChainId.cronos]: addressBookByChainId[ChainId.cronos].platforms.beefyfinance.multicall,
  [ChainId.aurora]: addressBookByChainId[ChainId.aurora].platforms.beefyfinance.multicall,
  [ChainId.fuse]: addressBookByChainId[ChainId.fuse].platforms.beefyfinance.multicall,
  [ChainId.metis]: addressBookByChainId[ChainId.metis].platforms.beefyfinance.multicall,
  [ChainId.moonbeam]: addressBookByChainId[ChainId.moonbeam].platforms.beefyfinance.multicall,
  [ChainId.emerald]: addressBookByChainId[ChainId.emerald].platforms.beefyfinance.multicall,
  [ChainId.optimism]: addressBookByChainId[ChainId.optimism].platforms.beefyfinance.multicall,
  [ChainId.kava]: addressBookByChainId[ChainId.kava].platforms.beefyfinance.multicall,
  [ChainId.ethereum]: addressBookByChainId[ChainId.ethereum].platforms.beefyfinance.multicall,
  [ChainId.canto]: addressBookByChainId[ChainId.canto].platforms.beefyfinance.multicall,
  [ChainId.zksync]: addressBookByChainId[ChainId.zksync].platforms.beefyfinance.multicall,
  [ChainId.zkevm]: addressBookByChainId[ChainId.zkevm].platforms.beefyfinance.multicall,
  [ChainId.base]: addressBookByChainId[ChainId.base].platforms.beefyfinance.multicall,
  [ChainId.gnosis]: addressBookByChainId[ChainId.gnosis].platforms.beefyfinance.multicall,
  [ChainId.linea]: addressBookByChainId[ChainId.linea].platforms.beefyfinance.multicall,
  [ChainId.mantle]: addressBookByChainId[ChainId.mantle].platforms.beefyfinance.multicall,
};

export const MULTICALL_V3: Partial<Readonly<Record<ChainId, string>>> = {
  [ChainId.bsc]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.heco]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.polygon]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.fantom]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.avax]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.one]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.arbitrum]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.celo]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.moonriver]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.cronos]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.aurora]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.fuse]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.metis]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.moonbeam]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.emerald]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.optimism]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.kava]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.ethereum]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.canto]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.zksync]: '0x9A04a9e1d67151AB1E742E6D8965e0602410f91d',
  [ChainId.zkevm]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.base]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.gnosis]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.linea]: '0xcA11bde05977b3631167028862bE2a173976CA11',
  [ChainId.mantle]: '0xcA11bde05977b3631167028862bE2a173976CA11',
};

const clients: Record<keyof typeof ChainId, Web3[]> = {
  bsc: [],
  heco: [],
  avax: [],
  polygon: [],
  fantom: [],
  one: [],
  arbitrum: [],
  celo: [],
  moonriver: [],
  cronos: [],
  aurora: [],
  fuse: [],
  metis: [],
  moonbeam: [],
  emerald: [],
  optimism: [],
  kava: [],
  ethereum: [],
  canto: [],
  zksync: [],
  zkevm: [],
  base: [],
  gnosis: [],
  linea: [],
  mantle: [],
};
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new Web3(endpoint));
});
clients.heco.push(new Web3(HECO_RPC));
clients.avax.push(new Web3(AVAX_RPC));
clients.polygon.push(new Web3(POLYGON_RPC));
clients.fantom.push(new Web3(FANTOM_RPC));
clients.one.push(new Web3(ONE_RPC));
clients.arbitrum.push(new Web3(ARBITRUM_RPC));
clients.celo.push(new Web3(CELO_RPC));
clients.moonriver.push(new Web3(MOONRIVER_RPC));
clients.cronos.push(new Web3(CRONOS_RPC));
clients.aurora.push(new Web3(AURORA_RPC));
clients.fuse.push(new Web3(FUSE_RPC));
clients.metis.push(new Web3(METIS_RPC));
clients.moonbeam.push(new Web3(MOONBEAM_RPC));
clients.emerald.push(new Web3(EMERALD_RPC));
clients.optimism.push(new Web3(OPTIMISM_RPC));
clients.kava.push(new Web3(KAVA_RPC));
clients.ethereum.push(new Web3(ETH_RPC));
clients.canto.push(new Web3(CANTO_RPC));
clients.zksync.push(new Web3(ZKSYNC_RPC));
clients.zkevm.push(new Web3(ZKEVM_RPC));
clients.base.push(new Web3(BASE_RPC));
clients.gnosis.push(new Web3(GNOSIS_RPC));
clients.linea.push(new Web3(LINEA_RPC));
clients.mantle.push(new Web3(MANTLE_RPC));

export const chainRandomClients = {
  bscRandomClient: () => clients.bsc[~~(clients.bsc.length * Math.random())],
  hecoRandomClient: () => clients.heco[~~(clients.heco.length * Math.random())],
  avaxRandomClient: () => clients.avax[~~(clients.avax.length * Math.random())],
  polygonRandomClient: () => clients.polygon[~~(clients.polygon.length * Math.random())],
  fantomRandomClient: () => clients.fantom[~~(clients.fantom.length * Math.random())],
  oneRandomClient: () => clients.one[~~(clients.one.length * Math.random())],
  arbitrumRandomClient: () => clients.arbitrum[~~(clients.arbitrum.length * Math.random())],
  celoRandomClient: () => clients.celo[~~(clients.celo.length * Math.random())],
  moonriverRandomClient: () => clients.moonriver[~~(clients.moonriver.length * Math.random())],
  cronosRandomClient: () => clients.cronos[~~(clients.cronos.length * Math.random())],
  auroraRandomClient: () => clients.aurora[~~(clients.aurora.length * Math.random())],
  fuseRandomClient: () => clients.fuse[~~(clients.fuse.length * Math.random())],
  metisRandomClient: () => clients.metis[~~(clients.metis.length * Math.random())],
  moonbeamRandomClient: () => clients.moonbeam[~~(clients.moonbeam.length * Math.random())],
  emeraldRandomClient: () => clients.emerald[~~(clients.emerald.length * Math.random())],
  optimismRandomClient: () => clients.optimism[~~(clients.optimism.length * Math.random())],
  kavaRandomClient: () => clients.kava[~~(clients.kava.length * Math.random())],
  ethereumRandomClient: () => clients.ethereum[~~(clients.ethereum.length * Math.random())],
  cantoRandomClient: () => clients.canto[~~(clients.canto.length * Math.random())],
  zksyncRandomClient: () => clients.zksync[~~(clients.zksync.length * Math.random())],
  zkevmRandomClient: () => clients.zkevm[~~(clients.zkevm.length * Math.random())],
  baseRandomClient: () => clients.base[~~(clients.base.length * Math.random())],
  gnosisRandomClient: () => clients.gnosis[~~(clients.gnosis.length * Math.random())],
  lineaRandomClient: () => clients.linea[~~(clients.linea.length * Math.random())],
  mantleRandomClient: () => clients.mantle[~~(clients.mantle.length * Math.random())],
};

export const _web3Factory = (chainId: ChainId) => {
  switch (chainId) {
    case BSC_CHAIN_ID:
      return chainRandomClients.bscRandomClient();
    case HECO_CHAIN_ID:
      return chainRandomClients.hecoRandomClient();
    case AVAX_CHAIN_ID:
      return chainRandomClients.avaxRandomClient();
    case POLYGON_CHAIN_ID:
      return chainRandomClients.polygonRandomClient();
    case FANTOM_CHAIN_ID:
      return chainRandomClients.fantomRandomClient();
    case ONE_CHAIN_ID:
      return chainRandomClients.oneRandomClient();
    case ARBITRUM_CHAIN_ID:
      return chainRandomClients.arbitrumRandomClient();
    case CELO_CHAIN_ID:
      return chainRandomClients.celoRandomClient();
    case MOONRIVER_CHAIN_ID:
      return chainRandomClients.moonriverRandomClient();
    case CRONOS_CHAIN_ID:
      return chainRandomClients.cronosRandomClient();
    case AURORA_CHAIN_ID:
      return chainRandomClients.auroraRandomClient();
    case FUSE_CHAIN_ID:
      return chainRandomClients.fuseRandomClient();
    case METIS_CHAIN_ID:
      return chainRandomClients.metisRandomClient();
    case MOONBEAM_CHAIN_ID:
      return chainRandomClients.moonbeamRandomClient();
    case EMERALD_CHAIN_ID:
      return chainRandomClients.emeraldRandomClient();
    case OPTIMISM_CHAIN_ID:
      return chainRandomClients.optimismRandomClient();
    case KAVA_CHAIN_ID:
      return chainRandomClients.kavaRandomClient();
    case ETH_CHAIN_ID:
      return chainRandomClients.ethereumRandomClient();
    case CANTO_CHAIN_ID:
      return chainRandomClients.cantoRandomClient();
    case ZKSYNC_CHAIN_ID:
      return chainRandomClients.zksyncRandomClient();
    case ZKEVM_CHAIN_ID:
      return chainRandomClients.zkevmRandomClient();
    case BASE_CHAIN_ID:
      return chainRandomClients.baseRandomClient();
    case GNOSIS_CHAIN_ID:
      return chainRandomClients.gnosisRandomClient();
    case LINEA_CHAIN_ID:
      return chainRandomClients.lineaRandomClient();
    case MANTLE_CHAIN_ID:
      return chainRandomClients.mantleRandomClient();
  }
};

export const _multicallAddress = (chainId: ChainId) => MULTICALLS[chainId];
