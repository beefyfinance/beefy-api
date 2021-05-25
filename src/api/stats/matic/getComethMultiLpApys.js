const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/matic/StakingMultiRewards.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/comethMultiLpPools.json');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { comethClient } = require('../../../apollo/client');

const oracle = 'tokens';
const oracleId = 'MUST';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const comethLiquidityProviderFee = 0.005;

const getComethMultiLpApys = async () => {
  let apys = {};

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(
    comethClient,
    pairAddresses,
    comethLiquidityProviderFee
  );

  for (const pool of pools) {
    const tradingAprLookup = tradingAprs[pool.address.toLowerCase()];
    const tradingApr = tradingAprLookup ? tradingAprLookup : BigNumber(0);
    const apy = await getPoolApy(pool.rewardPool, pool, pool.sOracleId, 137, tradingApr);
    apys = { ...apys, ...apy };
  }

  return apys;
};

const getPoolApy = async (rewardPool, pool, sOracleId, chainId, tradingApr) => {
  const [yearlyRewardsInUsd, secondYearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getSecondYearlyRewardsInUsd(rewardPool, sOracleId),
    getTotalLpStakedInUsd(rewardPool, pool, chainId),
  ]);

  const yearlyRewards = yearlyRewardsInUsd.plus(secondYearlyRewardsInUsd);
  const simpleApy = yearlyRewards.dividedBy(totalStakedInUsd);
  const apy = getFarmWithTradingFeesApy(simpleApy, tradingApr, BASE_HPY, 1, 0.955);

  //console.log(pool.name, simpleApy.valueOf(), apy);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async RewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, RewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRates(0).call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getSecondYearlyRewardsInUsd = async (RewardPool, sOracleId) => {
  const tokenPrice = await fetchPrice({ oracle, id: sOracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, RewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRates(1).call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const secondYearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return secondYearlyRewardsInUsd;
};

module.exports = getComethMultiLpApys;
