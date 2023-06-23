const BigNumber = require('bignumber.js');
import ISolarVault from '../../../abis/moonriver/ISolarVault';
import { MOONRIVER_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';

const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
const getBlockTime = require('../../../utils/getBlockTime');
const pool = require('../../../data/moonriver/solarPool.json');

export const getSolarApy = async () => {
  const farmApys = await getFarmApys(pool[0]);
  return getApyBreakdown(pool, 0, farmApys, 0);
};

const getFarmApys = async pool => {
  const { totalAllocPoint, rewardRate, allocPoint, balance } = await getMasterChefData(pool);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalStakedInUsd = new BigNumber(balance).times(tokenPrice).dividedBy(pool.decimals);

  const secondsPerYear = 31536000;
  const secondsPerBlock = await getBlockTime(1285);
  const yearlyRewards = new BigNumber(rewardRate)
    .times(secondsPerYear)
    .dividedBy(secondsPerBlock)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool.decimals);

  const apy = [yearlyRewardsInUsd.dividedBy(totalStakedInUsd)];
  return apy;
};

const getMasterChefData = async pool => {
  const masterchefContract = fetchContract(pool.masterchef, ISolarVault, MOONRIVER_CHAIN_ID);

  const res = await Promise.all([
    masterchefContract.read.totalAllocPoint(),
    masterchefContract.read.solarPerBlock(),
    masterchefContract.read.poolInfo([pool.poolId]),
  ]);

  const totalAllocPoint = new BigNumber(res[0].toString());
  const rewardRate = new BigNumber(res[1].toString());
  const allocPoint = new BigNumber(res[2][1].toString());
  const balance = new BigNumber(res[2][6].toString());

  return { totalAllocPoint, rewardRate, allocPoint, balance };
};

module.exports = { getSolarApy };
