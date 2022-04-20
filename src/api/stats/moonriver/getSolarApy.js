const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');
const { moonriverWeb3: web3 } = require('../../../utils/web3');
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import { getContract } from '../../../utils/contractHelper';

const ISolarVault = require('../../../abis/moonriver/ISolarVault.json');
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
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const masterchefContract = getContract(ISolarVault, pool.masterchef);

  let calls = [
    {
      totalAllocPoint: masterchefContract.methods.totalAllocPoint(),
      rewardRate: masterchefContract.methods.solarPerBlock(),
      poolInfo: masterchefContract.methods.poolInfo(pool.poolId),
    },
  ];

  const res = await multicall.all([calls]);

  const totalAllocPoint = res[0].map(v => v.totalAllocPoint);
  const rewardRate = res[0].map(v => v.rewardRate);
  const allocPoint = res[0].map(v => v.poolInfo['1']);
  const balance = res[0].map(v => v.poolInfo['6']);

  return { totalAllocPoint, rewardRate, allocPoint, balance };
};

module.exports = { getSolarApy };
