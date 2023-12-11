const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
const { DAILY_HPY, OPTIMISM_CHAIN_ID } = require('../../../constants');
const { default: IRewardPool } = require('../../../abis/IRewardPool');
const { fetchContract } = require('../../rpc/client');

const REWARDS = '0x2275527112c94733081F2893de25c85F252DeFab';

const getbeVeloApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, DAILY_HPY, 1, 1);

  return { 'beefy-bevelo': apy };
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'VELO' });

  const rewardPool = fetchContract(REWARDS, IRewardPool, OPTIMISM_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const yearlyRewards = rewardRate.times(31536000);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(REWARDS, IRewardPool, OPTIMISM_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.totalSupply()).toString());
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'VELO' });

  return totalStaked.times(tokenPrice).dividedBy('1e18');
};

module.exports = getbeVeloApy;
