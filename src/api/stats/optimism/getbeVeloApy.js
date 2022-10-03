const BigNumber = require('bignumber.js');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { DAILY_HPY } = require('../../../constants');
const { getContractWithProvider } = require('../../../utils/contractHelper');

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

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(31536000);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = getContractWithProvider(IRewardPool, REWARDS, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'VELO' });

  return totalStaked.times(tokenPrice).dividedBy('1e18');
};

module.exports = getbeVeloApy;
