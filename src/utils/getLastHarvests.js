import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import StrategyCommonChefLPAbi from '../abis/common/Strategy/StrategyCommonChefLP';
import BigNumber from 'bignumber.js';

const getLastHarvests = async (vaults, chain) => {
  const chainId = ChainId[chain];

  const lastHarvestCalls = vaults.map(vault => {
    const strategyContract = fetchContract(vault.strategy, StrategyCommonChefLPAbi, chainId);
    return strategyContract.read.lastHarvest();
  });

  const lastHarvests = await Promise.allSettled(lastHarvestCalls);

  vaults.forEach(
    (v, i) =>
      (v.lastHarvest =
        lastHarvests[i].status === 'fulfilled'
          ? new BigNumber(lastHarvests[i].value).toNumber()
          : 0)
  );

  return vaults;
};

module.exports = { getLastHarvests };
