const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const HelmetStakingPool = require('../../../abis/HelmetStakingPool.json');
const { compound } = require('../../../utils/compound');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const getHelmetPoolApy = async () => {
  const stakingPool = '0x279a073C491C873DF040B05cc846A3c47252b52c';
  const helmet = '0x948d2a81086A075b3130BAc19e4c6DEe1D2E3fE8';
  const oracle = 'tokens';
  const oracleId = 'Helmet';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(stakingPool, helmet),
    getTotalStakedInUsd(stakingPool, helmet, oracle, oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);

  return { 'cake-helmet': apy };
};

const getYearlyRewardsInUsd = async stakingPool => {
  const stakingPoolContract = new web3.eth.Contract(HelmetStakingPool, stakingPool);

  let [rewardsDurationSeconds, rewardForDuration] = await Promise.all([
    stakingPoolContract.methods.rewardsDuration().call(),
    stakingPoolContract.methods.getRewardForDuration().call(),
  ]);

  rewardsDurationSeconds = new BigNumber(rewardsDurationSeconds);
  rewardForDuration = new BigNumber(rewardForDuration);

  const secondsPerYear = 31536000;
  const yearlyRewards = rewardForDuration.div(rewardsDurationSeconds).times(secondsPerYear);

  const price = await fetchPrice({ oracle: 'tokens', id: 'Helmet' });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getHelmetPoolApy;
