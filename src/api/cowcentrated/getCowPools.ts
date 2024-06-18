import { ApiChain } from '../../utils/chain';
import { CowPool, validateCowPools } from './types';
import optimismPools from '../../data/optimism/beefyCowVaults.json';
import basePools from '../../data/base/beefyCowVaults.json';
import arbitrumPools from '../../data/arbitrum/beefyCowVaults.json';
import moonbeamPools from '../../data/moonbeam/beefyCowVaults.json';
import lineaPools from '../../data/linea/beefyCowVaults.json';
import polygonPools from '../../data/matic/beefyCowVaults.json';

const chainToPools: Partial<Record<ApiChain, CowPool[]>> = {
  optimism: validateCowPools(optimismPools),
  base: validateCowPools(basePools),
  arbitrum: validateCowPools(arbitrumPools),
  moonbeam: validateCowPools(moonbeamPools),
  linea: validateCowPools(lineaPools),
  polygon: validateCowPools(polygonPools),
};

const chainsWithPools = (Object.keys(chainToPools) as ReadonlyArray<ApiChain>).filter(
  chainId => chainToPools[chainId].length > 0
);

export function getCowPoolChains(): ReadonlyArray<ApiChain> {
  return chainsWithPools;
}

export function getCowPools(chainId: ApiChain): ReadonlyArray<CowPool> {
  return chainToPools[chainId] || [];
}

export function getAllCowPools(): Partial<Record<ApiChain, ReadonlyArray<CowPool>>> {
  return chainToPools;
}
