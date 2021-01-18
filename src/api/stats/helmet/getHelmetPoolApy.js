const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../utils/compound');
const { getPrice } = require('../../../utils/getPrice');
const HelmetStakingPool = require('../../../abis/HelmetStakingPool.json');

const web3 = new Web3(process.env.BSC_RPC);

const getHelmetPoolApy = async () => {
  const stakingPool = '0x279a073C491C873DF040B05cc846A3c47252b52c';
  const helmet = '0x948d2a81086A075b3130BAc19e4c6DEe1D2E3fE8';
  const oracle = 'pancake';
  const oracleId = 'Helmet';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(stakingPool, helmet),
    getTotalStakedInUsd(stakingPool, helmet, oracle, oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  
  return { 'cake-helmet': apy };
};

const getYearlyRewardsInUsd = async (stakingPool, asset) => {
  const stakingPoolContract = new web3.eth.Contract(HelmetStakingPool, stakingPool);

  let [rewardsDurationSeconds, rewardForDuration] = await Promise.all([
    stakingPoolContract.methods.rewardsDuration().call(),
    stakingPoolContract.methods.getRewardForDuration().call()
  ]);

  rewardsDurationSeconds = new BigNumber(rewardsDurationSeconds);
  rewardForDuration = new BigNumber(rewardForDuration);

  const secondsPerYear = 31536000;
  const yearlyRewards = rewardForDuration.div(rewardsDurationSeconds).times(secondsPerYear);

  const price = await getPrice('pancake', 'Helmet');
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy('1e18');

  return yearlyRewardsInUsd;
};


module.exports = getHelmetPoolApy;
