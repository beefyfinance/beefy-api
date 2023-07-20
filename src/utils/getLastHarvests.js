import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';

const strategyAbi = require('../abis/common/Strategy/StrategyCommonChefLP.json');

const getLastHarvests = async (vaults, chain) => {
  const contracts = vaults.map(v => fetchContract(v.strategy, strategyAbi, ChainId[chain]));
  const lastHarvests = await Promise.allSettled(contracts.map(c => c.read.lastHarvest()));
  vaults.forEach(
    (v, i) =>
      (v.lastHarvest = lastHarvests[i].status === 'fulfilled' ? Number(lastHarvests[i].value) : 0)
  );
  return vaults;
};

module.exports = { getLastHarvests };
