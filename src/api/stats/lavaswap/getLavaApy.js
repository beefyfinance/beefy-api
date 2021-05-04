const BigNumber = require('bignumber.js');
const { hecoWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');

const oracle = 'tokens';
const oracleId = 'LAVA';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const lavaRewardPool = '0x13B453E4bEB8A9d80c91e7f33053Cb8193E33Ac2';

const getLavaApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  //console.log('lava-lava', simpleApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'lava-lava': apy };
};

const getTotalStakedInUsd = async () => {
  const tokenContract = new web3.eth.Contract(IRewardPool, lavaRewardPool);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, lavaRewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getLavaApy;
