import { ethers } from 'ethers';
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
  SYS_RPC,
  SYS_CHAIN_ID,
  EMERALD_RPC,
  EMERALD_CHAIN_ID,
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
  [ChainId.sys]: addressBookByChainId[ChainId.sys].platforms.beefyfinance.multicall,
  [ChainId.emerald]: addressBookByChainId[ChainId.emerald].platforms.beefyfinance.multicall,
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
  sys: [],
  emerald: [],
};
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new ethers.providers.JsonRpcProvider(endpoint));
});
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
clients.sys.push(new ethers.providers.JsonRpcProvider(SYS_RPC));
clients.emerald.push(new ethers.providers.JsonRpcProvider(EMERALD_RPC));

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
  sysRandomClient: () => clients.sys[~~(clients.sys.length * Math.random())],
  emeraldRandomClient: () => clients.emerald[~~(clients.emerald.length * Math.random())],
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
    case SYS_CHAIN_ID:
      return chainRandomClients.sysRandomClient();
    case EMERALD_CHAIN_ID:
      return chainRandomClients.emeraldRandomClient();
  }
};

export const _multicallAddress = (chainId: ChainId) => MULTICALLS[chainId];
