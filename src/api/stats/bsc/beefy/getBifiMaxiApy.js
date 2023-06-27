const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../../utils/compound');
const { DAILY_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: IRewardPool } = require('../../../../abis/IRewardPool');
const { fetchContract } = require('../../../rpc/client');

const BIFI = '0xCa3F508B8e4Dd382eE878A314789373D80A5190A';
const REWARDS = '0x0d5761D9181C7745855FC985f646a842EB254eB9';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBifiMaxiApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(REWARDS, BIFI, ORACLE, ORACLE_ID, DECIMALS),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('bifi-maxi');
  const apy = compound(simpleApy, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);

  return { 'bifi-maxi': apy };
};

const getYearlyRewardsInUsd = async () => {
  const bnbPrice = await fetchPrice({ oracle: 'tokens', id: 'WBNB' });

  const rewardPool = fetchContract(REWARDS, IRewardPool, BSC_CHAIN_ID);
  const rewardRate = new BigNumber(a(await rewardPool.read.rewardRate()).toString());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(bnbPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBifiMaxiApy;
