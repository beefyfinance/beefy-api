const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/pangolinLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const oracle = 'coingecko';
const oracleId = 'pangolin';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const pngAvaxRewardPool = '0x8FD2755c6ae7252753361991bDcd6fF55bDc01CE'; // PNG-AVAX

const getPangolinLpApys = async () => {
  let poolPngAvax = pools.filter(pool => pool.name === 'png-png-avax')[0];

  const values = await Promise.all([
    getPoolApy(pngAvaxRewardPool, poolPngAvax, 43114),
  ]);

  let apys = {};
  for (item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getTotalLpStakedInUsd(rewardPool, pool, 43114),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  console.log(pool.name, simpleApy.valueOf(), apy);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (pngRewardPool) => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pngRewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getPangolinLpApys;
