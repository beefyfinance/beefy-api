const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/avax/pangolinLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');

const oracle = 'tokens';
const oracleId = 'PNG';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const usdtAvaxRewardPool = '0x94C021845EfE237163831DAC39448cFD371279d6'; // USDT-AVAX
const pngAvaxRewardPool = '0x574d3245e36Cf8C9dc86430EaDb0fDB2F385F829'; // PNG-AVAX
const ethAvaxRewardPool = '0x417C02150b9a31BcaCb201d1D60967653384E1C6'; // ETH-AVAX
const wbtcAvaxRewardPool = '0xe968E9753fd2c323C2Fe94caFF954a48aFc18546'; // WBTC-AVAX
const linkAvaxRewardPool = '0xBDa623cDD04d822616A263BF4EdbBCe0B7DC4AE7'; // LINK-AVAX
const sushiAvaxRewardPool = '0xDA354352b03f87F84315eEF20cdD83c49f7E812e'; // SUSHI-AVAX
const uniAvaxRewardPool = '0x1F6aCc5F5fE6Af91C1BB3bEbd27f4807a243D935'; // UNI-AVAX
const usdtPngRewardPool = '0xE2510a1fCCCde8d2D1c40b41e8f71fB1F47E5bBA'; // USDT-PNG

const getPangolinLpApys = async () => {
  let poolUsdtAvax = pools.filter(pool => pool.name === 'png-usdt-avax')[0];
  let poolPngAvax = pools.filter(pool => pool.name === 'png-png-avax')[0];
  let poolEthAvax = pools.filter(pool => pool.name === 'png-eth-avax')[0];
  let poolWbtcAvax = pools.filter(pool => pool.name === 'png-wbtc-avax')[0];
  let poolLinkAvax = pools.filter(pool => pool.name === 'png-link-avax')[0];
  let poolSushiAvax = pools.filter(pool => pool.name === 'png-sushi-avax')[0];
  let poolUniAvax = pools.filter(pool => pool.name === 'png-uni-avax')[0];
  let poolUsdtPng = pools.filter(pool => pool.name === 'png-usdt-png')[0];

  const values = await Promise.all([
    getPoolApy(usdtAvaxRewardPool, poolUsdtAvax, 43114),
    getPoolApy(pngAvaxRewardPool, poolPngAvax, 43114),
    getPoolApy(ethAvaxRewardPool, poolEthAvax, 43114),
    getPoolApy(wbtcAvaxRewardPool, poolWbtcAvax, 43114),
    getPoolApy(linkAvaxRewardPool, poolLinkAvax, 43114),
    getPoolApy(sushiAvaxRewardPool, poolSushiAvax, 43114),
    getPoolApy(uniAvaxRewardPool, poolUniAvax, 43114),
    getPoolApy(usdtPngRewardPool, poolUsdtPng, 43114),
  ]);

  let apys = {};
  for (item of values) {
    apys = { ...apys, ...item };
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

const getYearlyRewardsInUsd = async pngRewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pngRewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getPangolinLpApys;
