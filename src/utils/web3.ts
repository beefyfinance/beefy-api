import Web3 from 'web3';
import { addressBookByChainId, ChainId } from 'blockchain-addressbook';
import { BeefyFinance } from 'blockchain-addressbook/build/types/beefyfinance';

const {
  BSC_RPC_ENDPOINTS,
  HECO_RPC,
  AVAX_RPC,
  POLYGON_RPC,
  FANTOM_RPC,
  BSC_CHAIN_ID,
  HECO_CHAIN_ID,
  AVAX_CHAIN_ID,
  POLYGON_CHAIN_ID,
  FANTOM_CHAIN_ID,
} = require('../constants');

const MULTICALLS: Record<ChainId, Pick<BeefyFinance, 'multicall'>['multicall']> = {
  [ChainId.bsc]: addressBookByChainId[ChainId.bsc].platforms.beefyfinance.multicall,
  [ChainId.heco]: addressBookByChainId[ChainId.heco].platforms.beefyfinance.multicall,
  [ChainId.polygon]: addressBookByChainId[ChainId.polygon].platforms.beefyfinance.multicall,
  [ChainId.fantom]: addressBookByChainId[ChainId.fantom].platforms.beefyfinance.multicall,
  [ChainId.avax]: addressBookByChainId[ChainId.avax].platforms.beefyfinance.multicall,
};

const clients: Record<keyof typeof ChainId, Web3[]> = {
  bsc: [],
  heco: [],
  avax: [],
  polygon: [],
  fantom: [],
};
BSC_RPC_ENDPOINTS.forEach(endpoint => {
  clients.bsc.push(new Web3(endpoint));
});
clients.heco.push(new Web3(HECO_RPC));
clients.avax.push(new Web3(AVAX_RPC));
clients.polygon.push(new Web3(POLYGON_RPC));
clients.fantom.push(new Web3(FANTOM_RPC));

const bscRandomClient = () => clients.bsc[~~(clients.bsc.length * Math.random())];
const hecoRandomClient = () => clients.heco[~~(clients.heco.length * Math.random())];
const avaxRandomClient = () => clients.avax[~~(clients.avax.length * Math.random())];
const polygonRandomClient = () => clients.polygon[~~(clients.polygon.length * Math.random())];
const fantomRandomClient = () => clients.fantom[~~(clients.fantom.length * Math.random())];

export const bscWeb3 = () => {
  return bscRandomClient();
};

export const hecoWeb3 = () => {
  return hecoRandomClient();
};

export const avaxWeb3 = () => {
  return avaxRandomClient();
};

export const polygonWeb3 = () => {
  return polygonRandomClient();
};

export const fantomWeb3 = () => {
  return fantomRandomClient();
};

export const web3Factory = (chainId: ChainId) => {
  switch (chainId) {
    case BSC_CHAIN_ID:
      return bscRandomClient();
    case HECO_CHAIN_ID:
      return hecoRandomClient();
    case AVAX_CHAIN_ID:
      return avaxRandomClient();
    case POLYGON_CHAIN_ID:
      return polygonRandomClient();
    case FANTOM_CHAIN_ID:
      return fantomRandomClient();
  }
};

export const multicallAddress = (chainId: ChainId) => MULTICALLS[chainId];
