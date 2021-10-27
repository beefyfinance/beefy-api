const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { DAILY_HPY } = require('../../../../constants');

const oracle = 'tokens';
const oracleId = 'POTS';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const rewards = '0xcF4C1D926547a491204C3C9BD52F282EdE0539E5';

const getPotsApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, DAILY_HPY, 1, 1);

  return { 'pots-pots': apy };
};

const getTotalStakedInUsd = async () => {
  const rewardPool = new web3.eth.Contract(IRewardPool, rewards);
  const totalStaked = new BigNumber(await rewardPool.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle: oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, rewards);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getPotsApy;
