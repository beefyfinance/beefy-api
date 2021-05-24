const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const { compound } = require('../../../../utils/compound');
const fetchPrice = require('../../../../utils/fetchPrice');
const { BASE_HPY } = require('../../../../constants');

const stakingPool = '0xf867ea84d04c79bbd812e76f3ecedf3d053fff91';
const oracle = 'tokens';
const oracleId = 'BHC';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBhcPoolApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);

  return { 'bhc-bhc': apy };
};

const getTotalStakedInUsd = async () => {
  const tokenContract = new web3.eth.Contract(IRewardPool, stakingPool);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const bhcPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, stakingPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(bhcPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBhcPoolApy;
