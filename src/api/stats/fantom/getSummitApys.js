const { fantomWeb3: web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');

const SummitCartographer = require('../../../abis/fantom/SummitCartographer.json');
const lpPools = require('../../../data/fantom/summitLpPools.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { spookyClient } = require('../../../apollo/client');
import { SPOOKY_LPF } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';

const cartographer = '0x46d303b6829aDc7AC3217D92f71B1DbbE77eBBA2';
const oracleId = 'SUMMIT';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getSummitApys = async () => {
  const pools = [
    ...lpPools,
    {
      name: 'summit-summit',
      address: '0x8F9bCCB6Dd999148Da1808aC290F2274b13D7994',
      decimals: '1e18',
      poolId: 1,
      chainId: 250,
      oracle: 'tokens',
      oracleId: 'SUMMIT',
    },
  ];

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(cartographer, pool)));
  const farmAprs = await Promise.all(promises);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(spookyClient, pairAddresses, SPOOKY_LPF);

  return getApyBreakdown(pools, tradingAprs, farmAprs, SPOOKY_LPF);
};

const getPoolApy = async (rewardPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool, pool),
    getTotalStakedInUsd(rewardPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name,totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf(),simpleApy.valueOf());
  return simpleApy;
};

const getTotalStakedInUsd = async (rewardPool, pool) => {
  const contract = new web3.eth.Contract(SummitCartographer, rewardPool);
  const staked = new BigNumber(await contract.methods.stakedSupply(pool.poolId).call());
  const price = await fetchPrice({ oracle: pool.oracle || 'lps', id: pool.oracleId || pool.name });
  return staked.times(price).dividedBy(pool.decimals);
};

const getYearlyRewardsInUsd = async (rewardPool, pool) => {
  const contract = new web3.eth.Contract(SummitCartographer, rewardPool);

  let [summitPerSecond, totalAlloc, poolAlloc, poolMultiplier] = await Promise.all([
    contract.methods.summitPerSecond().call(),
    contract.methods.totalSharedAlloc().call(),
    contract.methods.tokenSharedAlloc(pool.address).call(),
    contract.methods.tokenElevationEmissionMultiplier(pool.address, 0).call(),
  ]);
  summitPerSecond = new BigNumber(summitPerSecond);
  totalAlloc = new BigNumber(totalAlloc);
  poolAlloc = new BigNumber(poolAlloc);
  poolMultiplier = new BigNumber(poolMultiplier);

  const secondsPerYear = 31536000;
  const yearlyRewards = summitPerSecond
    .times(secondsPerYear)
    .times(poolAlloc)
    .times(poolMultiplier)
    .dividedBy(totalAlloc)
    .dividedBy('1e12');

  const price = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getSummitApys;
