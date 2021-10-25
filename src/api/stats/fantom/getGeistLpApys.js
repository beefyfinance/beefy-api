const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

import getApyBreakdown from '../common/getApyBreakdown';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { spookyClient } from '../../../apollo/client';
import { SPOOKY_LPF } from '../../../constants';

const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const MasterChef = require('../../../abis/fantom/GeistChef.json');
const pools = require('../../../data/fantom/geistLpPools.json');

const chef = '0xE40b7FA6F5F7FB0Dc7d56f433814227AAaE020B5';
const oracle = 'tokens';
const oracleId = 'GEIST';
const DECIMALS = '1e18';

const getGeistLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(spookyClient, pairAddresses, SPOOKY_LPF);

  const farmApys = [];
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(chef, pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmApys.push(item);
  }

  return getApyBreakdown(pools, tradingAprs, farmApys, SPOOKY_LPF);
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool, pool.chainId),
  ]);
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

module.exports = getGeistLpApys;
