import type { ApiChain } from '../../utils/chain.ts';
import { type CowClm, validateCowClms } from './types.ts';
import arbitrumPools from '../../data/arbitrum/beefyCowVaults.json' with { type: 'json' };
import avaxPools from '../../data/avax/beefyCowVaults.json' with { type: 'json' };
import basePools from '../../data/base/beefyCowVaults.json' with { type: 'json' };
import berachainPools from '../../data/berachain/beefyCowVaults.json' with { type: 'json' };
import bscPools from '../../data/bsc/beefyCowVaults.json' with { type: 'json' };
import ethereumPools from '../../data/ethereum/beefyCowVaults.json' with { type: 'json' };
import gnosisPools from '../../data/gnosis/beefyCowVaults.json' with { type: 'json' };
import hyperevmPools from '../../data/hyperevm/beefyCowVaults.json' with { type: 'json' };
import lineaPools from '../../data/linea/beefyCowVaults.json' with { type: 'json' };
import liskPools from '../../data/lisk/beefyCowVaults.json' with { type: 'json' };
import mantlePools from '../../data/mantle/beefyCowVaults.json' with { type: 'json' };
import polygonPools from '../../data/matic/beefyCowVaults.json' with { type: 'json' };
import megaethPools from '../../data/megaeth/beefyCowVaults.json' with { type: 'json' };
import monadPools from '../../data/monad/beefyCowVaults.json' with { type: 'json' };
import optimismPools from '../../data/optimism/beefyCowVaults.json' with { type: 'json' };
import plasmaPools from '../../data/plasma/beefyCowVaults.json' with { type: 'json' };
import robinhoodPools from '../../data/robinhood/beefyCowVaults.json' with { type: 'json' };
import rootstockPools from '../../data/rootstock/beefyCowVaults.json' with { type: 'json' };
import scrollPools from '../../data/scroll/beefyCowVaults.json' with { type: 'json' };
import seiPools from '../../data/sei/beefyCowVaults.json' with { type: 'json' };
import sonicPools from '../../data/sonic/beefyCowVaults.json' with { type: 'json' };
import zksyncPools from '../../data/zksync/beefyCowVaults.json' with { type: 'json' };

const chainToClms: Readonly<Partial<Record<ApiChain, CowClm[]>>> = {
  optimism: validateCowClms(optimismPools),
  base: validateCowClms(basePools),
  arbitrum: validateCowClms(arbitrumPools),
  linea: validateCowClms(lineaPools),
  polygon: validateCowClms(polygonPools),
  zksync: validateCowClms(zksyncPools),
  mantle: validateCowClms(mantlePools),
  sei: validateCowClms(seiPools),
  bsc: validateCowClms(bscPools),
  avax: validateCowClms(avaxPools),
  rootstock: validateCowClms(rootstockPools),
  scroll: validateCowClms(scrollPools),
  lisk: validateCowClms(liskPools),
  sonic: validateCowClms(sonicPools),
  berachain: validateCowClms(berachainPools),
  gnosis: validateCowClms(gnosisPools),
  hyperevm: validateCowClms(hyperevmPools),
  plasma: validateCowClms(plasmaPools),
  monad: validateCowClms(monadPools),
  megaeth: validateCowClms(megaethPools),
  robinhood: validateCowClms(robinhoodPools),
  ethereum: validateCowClms(ethereumPools),
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
