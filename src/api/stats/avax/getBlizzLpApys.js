const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

import getApyBreakdown from '../common/getApyBreakdown';
import { getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { joeClient } from '../../../apollo/client';
import { JOE_LPF } from '../../../constants';

const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const MasterChef = require('../../../abis/fantom/GeistChef.json');
const pools = require('../../../data/avax/blizzLpPools.json');

const chef = '0x514E0B2Ad01E44A7f1d31a83A662E42C2b585849';
const oracle = 'tokens';
const oracleId = 'BLZZ';
const DECIMALS = '1e18';

const getBlizzLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprSushi(joeClient, pairAddresses, JOE_LPF);

  const farmApys = [];
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(chef, pool)));
  const values = await Promise.all(promises);
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
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const rewardsPerSec = new BigNumber(await masterchefContract.methods.rewardsPerSecond().call());
  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.address).call();
  allocPoint = new BigNumber(allocPoint);
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());

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
