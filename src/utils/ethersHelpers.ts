import { ethers } from 'ethers';
import { addressBookByChainId, ChainId } from '../../packages/address-book/src/address-book';
import { BeefyFinance } from '../../packages/address-book/src/types/beefyfinance';

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
  FRAXTAL_RPC,
  FRAXTAL_CHAIN_ID,
  MODE_RPC,
  MODE_CHAIN_ID,
  MANTA_RPC,
  MANTA_CHAIN_ID,
  REAL_RPC,
  REAL_CHAIN_ID,
  SEI_RPC,
  SEI_CHAIN_ID,
  ROOTSTOCK_RPC,
  ROOTSTOCK_CHAIN_ID,
  SCROLL_RPC,
  SCROLL_CHAIN_ID,
  LISK_RPC,
  LISK_CHAIN_ID,
  SONIC_RPC,
  SONIC_CHAIN_ID,
  BERACHAIN_RPC,
  BERACHAIN_CHAIN_ID,
  UNICHAIN_RPC,
  UNICHAIN_CHAIN_ID,
} from '../constants';

console.log(addressBookByChainId[ChainId.fantom].platforms.beefyfinance.multicall);
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
  [ChainId.fraxtal]: addressBookByChainId[ChainId.fraxtal].platforms.beefyfinance.multicall,
  [ChainId.mode]: addressBookByChainId[ChainId.mode].platforms.beefyfinance.multicall,
  [ChainId.manta]: addressBookByChainId[ChainId.manta].platforms.beefyfinance.multicall,
  [ChainId.real]: addressBookByChainId[ChainId.real].platforms.beefyfinance.multicall,
  [ChainId.sei]: addressBookByChainId[ChainId.sei].platforms.beefyfinance.multicall,
  [ChainId.rootstock]: addressBookByChainId[ChainId.rootstock].platforms.beefyfinance.multicall,
  [ChainId.scroll]: addressBookByChainId[ChainId.scroll].platforms.beefyfinance.multicall,
  [ChainId.lisk]: addressBookByChainId[ChainId.lisk].platforms.beefyfinance.multicall,
  [ChainId.sonic]: addressBookByChainId[ChainId.sonic].platforms.beefyfinance.multicall,
  [ChainId.berachain]: addressBookByChainId[ChainId.berachain].platforms.beefyfinance.multicall,
  [ChainId.unichain]: addressBookByChainId[ChainId.unichain].platforms.beefyfinance.multicall,
};

const clients: Record<keyof typeof ChainId, ethers.providers.JsonRpcProvider[]> = {
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
  fraxtal: [],
  mode: [],
  manta: [],
  real: [],
  sei: [],
  rootstock: [],
  scroll: [],
  lisk: [],
  sonic: [],
  berachain: [],
  unichain: [],
};
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new ethers.providers.JsonRpcProvider(endpoint));
});

// clients
clients.heco.push(new ethers.providers.JsonRpcProvider(HECO_RPC));
clients.avax.push(new ethers.providers.JsonRpcProvider(AVAX_RPC));
clients.polygon.push(new ethers.providers.JsonRpcProvider(POLYGON_RPC));
clients.fantom.push(new ethers.providers.JsonRpcProvider(FANTOM_RPC));
clients.one.push(new ethers.providers.JsonRpcProvider(ONE_RPC));
clients.arbitrum.push(new ethers.providers.JsonRpcProvider(ARBITRUM_RPC));
clients.celo.push(new ethers.providers.JsonRpcProvider(CELO_RPC));
clients.moonriver.push(new ethers.providers.JsonRpcProvider(MOONRIVER_RPC));
clients.cronos.push(new ethers.providers.JsonRpcProvider(CRONOS_RPC));
clients.aurora.push(new ethers.providers.JsonRpcProvider(AURORA_RPC));
clients.fuse.push(new ethers.providers.JsonRpcProvider(FUSE_RPC));
clients.metis.push(new ethers.providers.JsonRpcProvider(METIS_RPC));
clients.moonbeam.push(new ethers.providers.JsonRpcProvider(MOONBEAM_RPC));
clients.emerald.push(new ethers.providers.JsonRpcProvider(EMERALD_RPC));
clients.optimism.push(new ethers.providers.JsonRpcProvider(OPTIMISM_RPC));
clients.kava.push(new ethers.providers.JsonRpcProvider(KAVA_RPC));
clients.ethereum.push(new ethers.providers.JsonRpcProvider(ETH_RPC));
clients.canto.push(new ethers.providers.JsonRpcProvider(CANTO_RPC));
clients.zksync.push(new ethers.providers.JsonRpcProvider(ZKSYNC_RPC));
clients.zkevm.push(new ethers.providers.JsonRpcProvider(ZKEVM_RPC));
clients.base.push(new ethers.providers.JsonRpcProvider(BASE_RPC));
clients.gnosis.push(new ethers.providers.JsonRpcProvider(GNOSIS_RPC));
clients.linea.push(new ethers.providers.JsonRpcProvider(LINEA_RPC));
clients.mantle.push(new ethers.providers.JsonRpcProvider(MANTLE_RPC));
clients.fraxtal.push(new ethers.providers.JsonRpcProvider(FRAXTAL_RPC));
clients.mode.push(new ethers.providers.JsonRpcProvider(MODE_RPC));
clients.manta.push(new ethers.providers.JsonRpcProvider(MANTA_RPC));
clients.real.push(new ethers.providers.JsonRpcProvider(REAL_RPC));
clients.sei.push(new ethers.providers.JsonRpcProvider(SEI_RPC));
clients.rootstock.push(new ethers.providers.JsonRpcProvider(ROOTSTOCK_RPC));
clients.unichain.push(new ethers.providers.JsonRpcProvider(UNICHAIN_RPC));
clients.berachain.push(new ethers.providers.JsonRpcProvider(BERACHAIN_RPC));
clients.sonic.push(new ethers.providers.JsonRpcProvider(SONIC_RPC));
clients.lisk.push(new ethers.providers.JsonRpcProvider(LISK_RPC));
clients.scroll.push(new ethers.providers.JsonRpcProvider(SCROLL_RPC));

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
  fraxtalRandomClient: () => clients.fraxtal[~~(clients.fraxtal.length * Math.random())],
  modeRandomClient: () => clients.mode[~~(clients.mode.length * Math.random())],
  mantaRandomClient: () => clients.manta[~~(clients.manta.length * Math.random())],
  realRandomClient: () => clients.real[~~(clients.real.length * Math.random())],
  seiRandomClient: () => clients.sei[~~(clients.sei.length * Math.random())],
  rootstockRandomClient: () => clients.rootstock[~~(clients.rootstock.length * Math.random())],
  scrollRandomClient: () => clients.scroll[~~(clients.scroll.length * Math.random())],
  liskRandomClient: () => clients.lisk[~~(clients.lisk.length * Math.random())],
  sonicRandomClient: () => clients.sonic[~~(clients.sonic.length * Math.random())],
  berachainRandomClient: () => clients.berachain[~~(clients.berachain.length * Math.random())],
  unichainRandomClient: () => clients.unichain[~~(clients.unichain.length * Math.random())],
};

export const _ethersFactory = (chainId: ChainId) => {
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
    case FRAXTAL_CHAIN_ID:
      return chainRandomClients.fraxtalRandomClient();
    case MODE_CHAIN_ID:
      return chainRandomClients.modeRandomClient();
    case MANTA_CHAIN_ID:
      return chainRandomClients.mantaRandomClient();
    case REAL_CHAIN_ID:
      return chainRandomClients.realRandomClient();
    case SEI_CHAIN_ID:
      return chainRandomClients.seiRandomClient();
    case ROOTSTOCK_CHAIN_ID:
      return chainRandomClients.rootstockRandomClient();
    case SCROLL_CHAIN_ID:
      return chainRandomClients.scrollRandomClient();
    case LISK_CHAIN_ID:
      return chainRandomClients.liskRandomClient();
    case SONIC_CHAIN_ID:
      return chainRandomClients.sonicRandomClient();
    case BERACHAIN_CHAIN_ID:
      return chainRandomClients.berachainRandomClient();
    case UNICHAIN_CHAIN_ID:
      return chainRandomClients.unichainRandomClient();
  }
};

export const _multicallAddress = (chainId: ChainId) => MULTICALLS[chainId];
