const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/ooeLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: SimpleStaking } = require('../../../../abis/SimpleStaking');
const { BSC_CHAIN_ID } = require('../../../../constants');
const { fetchContract } = require('../../../rpc/client');

const oracle = 'tokens';
const oracleId = 'OOE';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getOOELpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalLpStakedInUsd(pool.rewardPool, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async pool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = fetchContract(pool.rewardPool, SimpleStaking, BSC_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardSpeed()).toString());
  const yearlyRewards = rewardRate.times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getOOELpApys;
