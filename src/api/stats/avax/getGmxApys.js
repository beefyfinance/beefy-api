const BigNumber = require('bignumber.js');
import { AVAX_CHAIN_ID } from '../../../constants';
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import StrategyABI from '../../../abis/StrategyABI';
import RewardTrackerAbi from '../../../abis/arbitrum/RewardTracker';
import { fetchContract } from '../../rpc/client';
import DistributorAbi from '../../../abis/arbitrum/Distributor';
const pools = require('../../../data/avax/gmxPools.json');

const DECIMALS = '1e18';
const SECONDS_PER_YEAR = 31536000;

const getGmxApys = async () => {
  let promises = [];
  let farmAprs = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmAprs.push(item);
  }

  return getApyBreakdown(pools, 0, farmAprs, 0);
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalStakedInUsd(pool),
  ]);

  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async pool => {
  let promises = [];
  let yearlyRewardsInUsd = new BigNumber(0);
  pool.rewardTrackers.forEach(rewardTracker =>
    promises.push(getTrackerRewards(pool, rewardTracker))
  );
  const values = await Promise.all(promises);
  for (const item of values) {
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(item);
  }

  return yearlyRewardsInUsd;
};

const getTrackerRewards = async (pool, rewardTracker) => {
  const rewardTrackerContract = fetchContract(
    rewardTracker.address,
    RewardTrackerAbi,
    AVAX_CHAIN_ID
  );
  const distributorContract = fetchContract(
    rewardTracker.distributor,
    DistributorAbi,
    AVAX_CHAIN_ID
  );

  const res = await Promise.all([
    distributorContract.read.tokensPerInterval(),
    rewardTrackerContract.read.stakedAmounts([pool.strategy]),
    rewardTrackerContract.read.totalSupply(),
  ]);

  const rewardPerSecond = new BigNumber(res[0].toString());
  const stakedAmounts = new BigNumber(res[1].toString());
  const totalSupply = new BigNumber(res[2].toString());
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: pool.rewardToken });

  const yearlyRewardsInUsd = rewardPerSecond
    .times(SECONDS_PER_YEAR)
    .times(rewardPrice)
    .dividedBy(DECIMALS);
  const strategyRewardsInUsd = yearlyRewardsInUsd.times(stakedAmounts).dividedBy(totalSupply);

  return strategyRewardsInUsd;
};

const getTotalStakedInUsd = async pool => {
  let staked = 0;
  if (pool.name == 'gmx-avax-glp') {
    const strategy = fetchContract(pool.strategy, StrategyABI, AVAX_CHAIN_ID);
    staked = new BigNumber((await strategy.read.balanceOf()).toString());
  } else {
    const stakedTrackerContract = fetchContract(
      pool.stakedTracker,
      RewardTrackerAbi,
      AVAX_CHAIN_ID
    );
    staked = new BigNumber(
      (await stakedTrackerContract.read.depositBalances([pool.strategy, pool.address])).toString()
    );
  }
  const stakedPrice = await fetchPrice({ oracle: pool.oracle, id: pool.tokenId });
  return staked.times(stakedPrice).dividedBy(DECIMALS);
};

module.exports = { getGmxApys };
