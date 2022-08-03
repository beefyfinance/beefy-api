const BigNumber = require('bignumber.js');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');

import getApyBreakdown from '../common/getApyBreakdown';
import { getTradingFeeAprSushi } from '../../../utils/getTradingFeeApr';
import { sushiArbitrumClient } from '../../../apollo/client';
import { SUSHI_LPF } from '../../../constants';
import { getContractWithProvider } from '../../../utils/contractHelper';

const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const MasterChef = require('../../../abis/fantom/GeistChef.json');
const pools = require('../../../data/arbitrum/radiantLpPools.json');

const chef = '0xc963ef7d977ECb0Ab71d835C4cb1Bf737f28d010';
const oracle = 'tokens';
const oracleId = 'RDNT';
const DECIMALS = '1e18';

const getRadiantLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprSushi(sushiArbitrumClient, pairAddresses, SUSHI_LPF);

  const farmApys = [];
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(chef, pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmApys.push(item);
  }

  return getApyBreakdown(pools, tradingAprs, farmApys, SUSHI_LPF);
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool, pool.chainId),
  ]);
  // console.log(pool.name, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), yearlyRewardsInUsd.dividedBy(totalStakedInUsd).valueOf())
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
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

module.exports = getRadiantLpApys;
