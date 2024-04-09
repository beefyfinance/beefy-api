const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import { fetchContract } from '../../rpc/client';
import { MANTLE_CHAIN_ID } from '../../../constants';
import mShardsPool from '../../../abis/mantle/mShardsPool';
import pools from '../../../data/mantle/mShardsPools.json';

const getmShardsApys = async () => {
  const farmApys = await getFarmApys();
  return getApyBreakdown(pools, {}, farmApys, 0);
};

export const getFarmApys = async () => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'WMNT' });
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: 'mShards' });

  const balanceCalls = [];
  const rewardRateCalls = [];
  const periodFinishCalls = [];
  const abi = mShardsPool;

  const rewardPool = fetchContract(pools[0].rewardPool, abi, MANTLE_CHAIN_ID);
  balanceCalls.push(rewardPool.read.totalStakedAmount());
  rewardRateCalls.push(rewardPool.read.rewardRate());
  periodFinishCalls.push(rewardPool.read.periodFinish());

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(rewardRateCalls),
    Promise.all(periodFinishCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  const periodFinishes = res[2].map(v => new BigNumber(v.toString()));

  const totalStakedInUsd = balances[0].times(tokenPrice).dividedBy('1e18');
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRates[0].times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(rewardPrice).dividedBy('1e18');

  const apy = periodFinishes[0].isGreaterThanOrEqualTo(Math.floor(Date.now() / 1000))
    ? yearlyRewardsInUsd.dividedBy(totalStakedInUsd)
    : new BigNumber(0);
  apys.push(apy);

  return apys;
};

module.exports = getmShardsApys;
