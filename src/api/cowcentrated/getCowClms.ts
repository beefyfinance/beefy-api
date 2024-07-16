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

const chainToClms: Partial<Record<ApiChain, CowClm[]>> = {
  optimism: validateCowClms(optimismPools),
  base: validateCowClms(basePools),
  arbitrum: validateCowClms(arbitrumPools),
  moonbeam: validateCowClms(moonbeamPools),
  linea: validateCowClms(lineaPools),
  polygon: validateCowClms(polygonPools),
  zksync: validateCowClms(zksyncPools),
  manta: validateCowClms(mantaPools),
  mantle: validateCowClms(mantlePools),
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

export function getAllCowClms(): Partial<Record<ApiChain, ReadonlyArray<CowClm>>> {
  return chainToClms;
}
