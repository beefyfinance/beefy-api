const BigNumber = require('bignumber.js');

const pools = require('../../../data/fantom/tombLpPools.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { spookyClient, tombswapClient } = require('../../../apollo/client');
import TombRewardPool from '../../../abis/fantom/TombRewardPool';
import { FANTOM_CHAIN_ID, SPOOKY_LPF, TOMBSWAP_LPF } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';

const rewardPool = '0xcc0a87F7e7c693042a9Cc703661F5060c80ACb43';
const oracleId = 'TSHARE';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getTombApys = async () => {
  const spookyPools = pools.filter(pool => pool.liquiditySource !== 'tomb');
  const tombPools = pools.filter(pool => pool.liquiditySource === 'tomb');

  const spookyPairAddresses = spookyPools.map(pool => pool.address);
  const tombPairAddresses = tombPools.map(pool => pool.address);

  const [spookyFarmAprs, tombFarmAprs, spookyTradingAprs, tombTradingAprs] = await Promise.all([
    Promise.all(spookyPools.map(pool => getPoolApy(rewardPool, pool))),
    Promise.all(tombPools.map(pool => getPoolApy(rewardPool, pool))),
    getTradingFeeApr(spookyClient, spookyPairAddresses, SPOOKY_LPF),
    getTradingFeeApr(tombswapClient, tombPairAddresses, TOMBSWAP_LPF),
  ]);

  const spookyBreakdown = getApyBreakdown(
    spookyPools,
    spookyTradingAprs,
    spookyFarmAprs,
    SPOOKY_LPF
  );
  const tombBreakdown = getApyBreakdown(tombPools, tombTradingAprs, tombFarmAprs, TOMBSWAP_LPF);

  const breakdown = { apys: {}, apyBreakdowns: {} };
  for (let pool in spookyBreakdown.apys) {
    breakdown.apys[pool] = spookyBreakdown.apys[pool];
    breakdown.apyBreakdowns[pool] = spookyBreakdown.apyBreakdowns[pool];
  }
  for (let pool in tombBreakdown.apys) {
    breakdown.apys[pool] = tombBreakdown.apys[pool];
    breakdown.apyBreakdowns[pool] = tombBreakdown.apyBreakdowns[pool];
  }
  return breakdown;
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool, pool.poolId),
    getTotalLpStakedInUsd(rewardPool, pool, pool.chainId),
  ]);

  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (rewardPool, poolId) => {
  const rewardPoolContract = fetchContract(rewardPool, TombRewardPool, FANTOM_CHAIN_ID);

  const fromTime = Math.floor(Date.now() / 1000);
  let [secondRewards, totalAllocPoint, allocPoint] = await Promise.all([
    rewardPoolContract.read
      .getGeneratedReward([fromTime, fromTime + 1])
      .then(res => new BigNumber(res.toString())),
    rewardPoolContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
    rewardPoolContract.read.poolInfo([poolId]).then(res => new BigNumber(res.toString())),
  ]);

  const secondsPerYear = 31536000;
  const yearlyRewards = secondRewards
    .times(secondsPerYear)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const price = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getTombApys;
