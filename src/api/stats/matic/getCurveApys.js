const axios = require('axios');
const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const IRewardGauge = require('../../../abis/IRewardPool.json');
const IRewardStream = require('../../../abis/ICurveRewardStream.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');

const poolId = 'curve-am3crv';
const rewardGauge = '0xe381C25de995d62b453aF8B931aAc84fcCaa7A62';
const rewardStream = '0xBdFF0C27dd073C119ebcb1299a68A6A92aE607F0';
const oracle = 'tokens';
const oracleId = 'WMATIC';
const DECIMALS = '1e18';
const secondsPerYear = 31536000;

const getCurveApys = async () => {
  const baseApy = await getBaseApy();
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const simpleApy = rewardsApy.plus(baseApy);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(poolId, baseApy, rewardsApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [poolId]: apy };
};

const getBaseApy = async () => {
  try {
    const response = await axios.get('https://stats.curve.fi/raw-stats-polygon/apys.json');
    const data = response.data.apy.total.aave;
    return Number(data);
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const getTotalStakedInUsd = async () => {
  const gauge = new web3.eth.Contract(IRewardGauge, rewardGauge);
  const totalSupply = new BigNumber(await gauge.methods.totalSupply().call());
  const lpPrice = await fetchPrice({ oracle: 'lps', id: poolId });
  return totalSupply.multipliedBy(lpPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardStream, rewardStream);
  const rewardRate = new BigNumber(await rewardPool.methods.reward_rate().call());
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getCurveApys;
