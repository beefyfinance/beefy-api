import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import { Vault } from '../api/vaults/types';
import { ApiChain } from './chain';
import StrategyCommonChefLPAbi from '../abis/common/Strategy/StrategyCommonChefLP';
import BigNumber from 'bignumber.js';

const getLastHarvests = async (vaults: Vault[], chain: ApiChain) => {
  const chainId = ChainId[chain];

  const strategyAddreses = vaults.map(v => v.strategy);
  const lastHarvestCalls = strategyAddreses.map(strategyAddress => {
    const strategyContract = fetchContract(strategyAddress, StrategyCommonChefLPAbi, chainId);
    return strategyContract.read.lastHarvest();
  });

  const res = await Promise.all(lastHarvestCalls);

  const lastHarvests = res.map(v => new BigNumber(v.toString()).toNumber());

  for (let i = 0; i < lastHarvests.length; i++) {
    vaults[i].lastHarvest = lastHarvests[i];
  }

  return vaults;
};

module.exports = { getLastHarvests };
