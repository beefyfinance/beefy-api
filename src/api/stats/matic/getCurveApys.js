const axios = require('axios');
const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const ICurvePool = require('../../../abis/ICurvePool.json');
const IRewardGauge = require('../../../abis/IRewardPool.json');
const IRewardStream = require('../../../abis/ICurveRewardStream.json');
const ICurveRewards = require('../../../abis/ICurveRewards.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { getAavePoolData } = require('./getAaveApys');
const aavePools = require('../../../data/matic/aavePools.json');

const poolId = 'curve-am3crv';
const curvePool = '0x445FE580eF8d70FF569aB36e80c647af338db351';
const rewardGauge = '0xe381C25de995d62b453aF8B931aAc84fcCaa7A62';
const rewardStream = '0xBdFF0C27dd073C119ebcb1299a68A6A92aE607F0';
const crvRewards = '0xC48f4653dd6a9509De44c92beb0604BEA3AEe714';
const crv = '0x172370d5Cd63279eFa6d502DAB29171933a610AF';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerYear = 31536000;

const tokens = [
  { i: 0, aaveId: 'aave-dai', decimals: '1e18' },
  { i: 1, aaveId: 'aave-usdc', decimals: '1e6' },
  { i: 2, aaveId: 'aave-usdt', decimals: '1e6' },
];

const getCurveApys = async () => {
  const aaveMaticApy = await getAaveMaticApy();
  const baseApy = await getBaseApy();
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const rewardsApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const simpleApy = rewardsApy.plus(aaveMaticApy).times(955).dividedBy(1000).plus(baseApy);
  const apy = compound(simpleApy, process.env.BASE_HPY);
  // console.log(poolId, baseApy, aaveMaticApy.toNumber(), rewardsApy.toNumber(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
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
  const maticPrice = await fetchPrice({ oracle, id: 'WMATIC' });
  const rewardPool = new web3.eth.Contract(IRewardStream, rewardStream);
  const periodFinish = Number(await rewardPool.methods.period_finish().call());
  let maticRewardsInUsd = new BigNumber(0);
  if (periodFinish > Date.now() / 1000) {
    const rewardRate = new BigNumber(await rewardPool.methods.reward_rate().call());
    maticRewardsInUsd = rewardRate.times(secondsPerYear).times(maticPrice).dividedBy(DECIMALS);
  }

  const crvPrice = await fetchPrice({ oracle, id: 'CRV' });
  const crvRewardsContract = new web3.eth.Contract(ICurveRewards, crvRewards);
  let { rate } = await crvRewardsContract.methods.reward_data(crv).call();
  rate = new BigNumber(rate);
  const crvRewardsInUsd = rate.times(secondsPerYear).times(crvPrice).dividedBy(DECIMALS);

  // console.log('curve matic', maticRewardsInUsd.toNumber(), 'crv', crvRewardsInUsd.toNumber());

  return maticRewardsInUsd.plus(crvRewardsInUsd);
};

const getAaveMaticApy = async () => {
  const curveAaveIds = tokens.map(({ aaveId }) => aaveId);
  const curveAavePools = aavePools.filter(p => curveAaveIds.includes(p.name));

  let promises = [];
  curveAavePools.forEach(pool => promises.push(getAavePoolData(pool)));
  const aaveApys = await Promise.all(promises);

  promises = [];
  tokens.forEach(token => promises.push(getTokenBalance(curvePool, token)));
  const balances = await Promise.all(promises);

  let totalBalances = new BigNumber(0);
  balances.forEach(b => (totalBalances = totalBalances.plus(b)));

  let totalApy = new BigNumber(0);
  tokens.forEach(({ aaveId }, i) => {
    const aaveApy = aaveApys[i].supplyMatic;
    const balance = balances[i];
    totalApy = totalApy.plus(aaveApy.times(balance).dividedBy(totalBalances));
  });

  return totalApy;
};

const getTokenBalance = async (curvePool, token) => {
  const pool = new web3.eth.Contract(ICurvePool, curvePool);
  const balance = await pool.methods.balances(token.i).call();
  return new BigNumber(balance).dividedBy(token.decimals);
};

module.exports = getCurveApys;
