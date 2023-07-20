const BigNumber = require('bignumber.js');
import getApyBreakdown from '../common/getApyBreakdown';
import { getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { joeClient } from '../../../apollo/client';
import { AVAX_CHAIN_ID, JOE_LPF } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import GeistChef from '../../../abis/fantom/GeistChef';

const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const pools = require('../../../data/avax/blizzLpPools.json');

const chef = '0x514E0B2Ad01E44A7f1d31a83A662E42C2b585849';
const oracle = 'tokens';
const oracleId = 'BLZZ';
const DECIMALS = '1e18';

const getBlizzLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprPromise = getTradingFeeAprSushi(joeClient, pairAddresses, JOE_LPF);

  const farmApys = [];
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(chef, pool)));
  const [tradingAprs, values] = await Promise.all([tradingAprPromise, Promise.all(promises)]);
  for (const item of values) {
    farmApys.push(item);
  }

  return getApyBreakdown(pools, tradingAprs, farmApys, JOE_LPF);
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool, pool.chainId),
  ]);
  // console.log(pool.name, totalStakedInUsd.toNumber(), yearlyRewardsInUsd.toNumber());
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const masterchefContract = fetchContract(masterchef, GeistChef, AVAX_CHAIN_ID);

  const [rewardsPerSec, allocPoint, totalAllocPoint] = await Promise.all([
    masterchefContract.read.rewardsPerSecond().then(res => new BigNumber(res.toString())),
    masterchefContract.read.poolInfo([pool.address]).then(res => new BigNumber(res[0].toString())),
    masterchefContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);

  const secondsPerYear = 31536000;
  const yearlyRewards = rewardsPerSec
    .times(allocPoint)
    .times(secondsPerYear)
    .dividedBy(totalAllocPoint)
    .dividedBy(2); // 50% penalty

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBlizzLpApys;
