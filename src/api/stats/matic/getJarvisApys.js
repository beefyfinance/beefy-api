const { polygonWeb3: web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');

const MasterChef = require('../../../abis/matic/ElysianFields.json');
const pools = require('../../../data/matic/jarvisPools.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const getBlockTime = require('../../../utils/getBlockTime');
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveFactoryApy } from '../common/curve/getCurveApyData';

const DECIMALS = '1e18';

const getJarvisApys = async () => {
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const farmAprs = await Promise.all(promises);
  const tradingAprs = await getCurveFactoryApy(
    pools[0].address,
    'https://api.curve.fi/api/getFactoryAPYs-polygon'
  );

  return getApyBreakdown(pools, tradingAprs, farmAprs, 0.004);
};

const getPoolApy = async (pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool.masterchef, pool.poolId, pool.rewardOracle, pool.rewardToken),
    getTotalLpStakedInUsd(pool.masterchef, pool, pool.chainId),
  ]);

  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (masterchef, poolId, oracle, oracleId) => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  let { allocPoint } = await masterchefContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.methods.rwdPerBlock().call(),
    masterchefContract.methods.totalAllocPoints().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  const secondsPerYear = 31536000;
  const secondsPerBlock = await getBlockTime(137);
  const yearlyRewards = blockRewards
    .times(secondsPerYear)
    .dividedBy(secondsPerBlock)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const price = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = { getJarvisApys };