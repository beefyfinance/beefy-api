const BigNumber = require('bignumber.js');
const { compound } = require('../../../utils/compound');
import { getEDecimals } from '../../../utils/getEDecimals';
const { BASE_HPY, FUSE_CHAIN_ID } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import IRewarder from '../../../abis/fuse/IRewarder';
import IStaker from '../../../abis/fuse/IStaker';
import { fetchContract } from '../../rpc/client';

const {
  fuse: {
    platforms: {
      fuseNetwork: { rewarder, staker },
    },
    tokens: { WFUSE },
  },
} = addressBook;

const BLOCKS_PER_DAY = 17280; // 5 Second Block Times

const getFuseBeefySingleApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.times(0.85).dividedBy(totalStakedInUsd);
  const beefyPerformanceFee = getTotalPerformanceFeeForVault('fuse-fuse');
  const apy = compound(apr, BASE_HPY, 1, 1 - beefyPerformanceFee);

  return {
    apys: {
      'fuse-fuse': apy,
    },
    apyBreakdowns: {
      'fuse-fuse': {
        vaultApr: apr,
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: apy,
        totalApy: apy,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const rewardPool = fetchContract(rewarder, IRewarder, FUSE_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.getBlockRewardAmount()).toString());
  const yearlyRewards = rewardRate.times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.dividedBy(getEDecimals(WFUSE.decimals));

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const stakerContract = fetchContract(staker, IStaker, FUSE_CHAIN_ID);
  const totalStaked = new BigNumber((await stakerContract.read.totalStakeAmount()).toString());

  return totalStaked.dividedBy(getEDecimals(WFUSE.decimals));
};

module.exports = getFuseBeefySingleApy;
