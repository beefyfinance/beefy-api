import { ApiChain } from '../../utils/chain';
import { CowClm, validateCowClms } from './types';
import optimismPools from '../../data/optimism/beefyCowVaults.json';
import basePools from '../../data/base/beefyCowVaults.json';
import arbitrumPools from '../../data/arbitrum/beefyCowVaults.json';
import moonbeamPools from '../../data/moonbeam/beefyCowVaults.json';
import lineaPools from '../../data/linea/beefyCowVaults.json';
import polygonPools from '../../data/matic/beefyCowVaults.json';
import zksyncPools from '../../data/zksync/beefyCowVaults.json';
import mantaPools from '../../data/manta/beefyCowVaults.json';
import mantlePools from '../../data/mantle/beefyCowVaults.json';
import seiPools from '../../data/sei/beefyCowVaults.json';
import bscPools from '../../data/bsc/beefyCowVaults.json';
import avaxPools from '../../data/avax/beefyCowVaults.json';
import rootstockPools from '../../data/rootstock/beefyCowVaults.json';
import scrollPools from '../../data/scroll/beefyCowVaults.json';
import modePools from '../../data/mode/beefyCowVaults.json';
import liskPools from '../../data/lisk/beefyCowVaults.json';
import sonicPools from '../../data/sonic/beefyCowVaults.json';
import berachainPools from '../../data/berachain/beefyCowVaults.json';
import gnosisPools from '../../data/gnosis/beefyCowVaults.json';
import sagaPools from '../../data/saga/beefyCowVaults.json';
import hyperevmPools from '../../data/hyperevm/beefyCowVaults.json';
const chainToClms: Readonly<Partial<Record<ApiChain, CowClm[]>>> = {
  optimism: validateCowClms(optimismPools),
  base: validateCowClms(basePools),
  arbitrum: validateCowClms(arbitrumPools),
  moonbeam: validateCowClms(moonbeamPools),
  linea: validateCowClms(lineaPools),
  polygon: validateCowClms(polygonPools),
  zksync: validateCowClms(zksyncPools),
  manta: validateCowClms(mantaPools),
  mantle: validateCowClms(mantlePools),
  sei: validateCowClms(seiPools),
  bsc: validateCowClms(bscPools),
  avax: validateCowClms(avaxPools),
  rootstock: validateCowClms(rootstockPools),
  scroll: validateCowClms(scrollPools),
  mode: validateCowClms(modePools),
  lisk: validateCowClms(liskPools),
  sonic: validateCowClms(sonicPools),
  berachain: validateCowClms(berachainPools),
  gnosis: validateCowClms(gnosisPools),
  saga: validateCowClms(sagaPools),
  hyperevm: validateCowClms(hyperevmPools),
};

const chainsWithClms = (Object.keys(chainToClms) as ReadonlyArray<ApiChain>).filter(
  chainId => chainToClms[chainId].length > 0
);

export function getCowClmChains(): ReadonlyArray<ApiChain> {
  return chainsWithClms;
}

export function getCowClms(chainId: ApiChain): ReadonlyArray<CowClm> {
  return chainToClms[chainId] || [];
}

export function getAllCowClmsByChain() {
  return chainToClms;
}
