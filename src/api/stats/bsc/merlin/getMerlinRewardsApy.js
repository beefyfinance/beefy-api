const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const { compound } = require('../../../../utils/compound');
const fetchPrice = require('../../../../utils/fetchPrice');
const { BASE_HPY } = require('../../../../constants');

const stakingPool = '0x3b87475ac293eeed0e8bC25713Eb8242A9497C3F';
const oracle = 'tokens';
const oracleId = 'MERL';
const rewardOracle = 'lps';
const rewardOracleId = 'merlin-merl-bnb';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMerlinRewardsApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log('merlin', simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'merlin-merlin': apy };
};

const getTotalStakedInUsd = async () => {
  const tokenContract = new web3.eth.Contract(IRewardPool, stakingPool);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const price = await fetchPrice({ oracle: rewardOracle, id: rewardOracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, stakingPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getMerlinRewardsApy;
