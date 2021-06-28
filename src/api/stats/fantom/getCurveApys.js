const axios = require('axios');
const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const IRewardGauge = require('../../../abis/IRewardPool.json');
const ICurveRewards = require('../../../abis/ICurveRewards.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const pools = require('../../../data/fantom/curvePools.json');

const crv = '0x1E4F97b9f9F913c46F1632781732927B9019C68b';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerYear = 31536000;

const getCurveApys = async () => {
  let apys = {};

  const baseApyData = await getBaseApyData();

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(baseApyData, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (baseApyData, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const baseApy = getBaseApy(baseApyData, pool);
  const simpleApy = rewardsApy.times(955).dividedBy(1000).plus(baseApy);
  const apy = compound(simpleApy, process.env.BASE_HPY);
  // console.log(pool.name, baseApy, rewardsApy.toNumber(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getBaseApyData = async () => {
  try {
    const response = await axios.get('https://stats.curve.fi/raw-stats-ftm/apys.json');
    return response.data.apy;
  } catch (err) {
    console.error(err);
  }
};

const getBaseApy = (baseApyData, pool) => {
  try {
    return Math.max(
      baseApyData.day[pool.baseApyKey],
      baseApyData.week[pool.baseApyKey],
      baseApyData.month[pool.baseApyKey],
      baseApyData.total[pool.baseApyKey]
    );
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const getTotalStakedInUsd = async pool => {
  const gauge = new web3.eth.Contract(IRewardGauge, pool.gauge);
  const totalSupply = new BigNumber(await gauge.methods.totalSupply().call());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
  return totalSupply.multipliedBy(lpPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async pool => {
  const crvRewardsContract = new web3.eth.Contract(ICurveRewards, pool.rewards);
  let { rate } = await crvRewardsContract.methods.reward_data(crv).call();
  rate = new BigNumber(rate);
  const crvPrice = await fetchPrice({ oracle, id: 'CRV' });
  const crvRewardsInUsd = rate.times(secondsPerYear).times(crvPrice).dividedBy(DECIMALS);
  return crvRewardsInUsd;
};

module.exports = getCurveApys;
