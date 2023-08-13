const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/base/swapBasedLpPools.json');
const { default: StakingRewardsFactory } = require('../../../abis/base/StakingRewardsFactory');

const getSwapBasedApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchefAbi: StakingRewardsFactory,
    masterchef: '0xd5470bF72a5A15bccc68806a3709277Dc72e88F1',
    tokenPerBlock: 'globalSkullPerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'BASE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    depositFee: 0.01,
    // log: true,
  });

module.exports = getSwapBasedApys;
