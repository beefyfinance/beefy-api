const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');

const Strategy = require('../../../abis/StrategyABI.json');
const RewardTracker = require('../../../abis/arbitrum/RewardTracker.json');
const Distributor = require('../../../abis/arbitrum/Distributor.json');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from '../common/getApyBreakdown';
import { getContractWithProvider } from '../../../utils/contractHelper';
const pools = require('../../../data/arbitrum/gmxPools.json');

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
  pool.rewardTrackers.forEach(rewardTracker => promises.push(getTrackerRewards(pool, rewardTracker)));
  const values = await Promise.all(promises);
  for (const item of values) {
    yearlyRewardsInUsd = yearlyRewardsInUsd.plus(item);
  }
  
  return yearlyRewardsInUsd;
};

const getTrackerRewards = async (pool, rewardTracker) => {
  const rewardTrackerContract = getContractWithProvider(RewardTracker, rewardTracker.address, web3);
  const distibutorContract = getContractWithProvider(Distributor, rewardTracker.distributor, web3);

  let [rewardPerSecond, stakedAmounts, totalSupply] = await Promise.all([
    distibutorContract.methods.tokensPerInterval().call(),
    rewardTrackerContract.methods.stakedAmounts(pool.strategy).call(),
    rewardTrackerContract.methods.totalSupply().call(),
  ]);

  rewardPerSecond = new BigNumber(rewardPerSecond);
  stakedAmounts = new BigNumber(stakedAmounts);
  totalSupply = new BigNumber(totalSupply);

  const rewardPrice = await fetchPrice({oracle: 'tokens', id: pool.rewardToken});

  const yearlyRewardsInUsd = rewardPerSecond.times(SECONDS_PER_YEAR).times(rewardPrice).dividedBy(DECIMALS);
  const strategyRewardsInUsd = yearlyRewardsInUsd.times(stakedAmounts).dividedBy(totalSupply);

  return strategyRewardsInUsd;
};

const getTotalStakedInUsd = async pool => {
  let staked = 0;
  if (pool.name == 'gmx-arb-glp') {
    const strategy = getContractWithProvider(Strategy, pool.strategy, web3);
    staked = new BigNumber(await strategy.methods.balanceOf().call());
  } else {
    const stakedTrackerContract = getContractWithProvider(RewardTracker, pool.stakedTracker, web3);
    staked = new BigNumber(await stakedTrackerContract.methods.depositBalances(pool.strategy, pool.address).call());
  }
  const stakedPrice = await fetchPrice({oracle: 'tokens', id: pool.tokenId});
  return staked.times(stakedPrice).dividedBy(DECIMALS);
};

module.exports = { getGmxApys };
