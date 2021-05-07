const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/quickLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');

const oracle = 'tokens';
const oracleId = 'QUICK';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getQuickLpApys = async () => { 
  let apys = {};

    for (const pool of pools) {
      const apy = await getPoolApy(pool.rewardPool, pool, 137)
      apys = { ...apys, ...apy };
    }
  
    return apys;
  };

const getPoolApy = async (rewardPool, pool, chainId) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getTotalLpStakedInUsd(rewardPool, pool, chainId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async RewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, RewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getQuickLpApys;