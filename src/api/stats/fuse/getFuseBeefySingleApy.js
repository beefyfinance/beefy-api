const BigNumber = require('bignumber.js');
const { web3Factory } = require('../../../utils/web3');

const Rewarder = require('../../../abis/fuse/IRewarder.json');
const Staker = require('../../../abis/fuse/IStaker.json');
const { compound } = require('../../../utils/compound');

import { getEDecimals } from '../../../utils/getEDecimals';
const { FUSE_CHAIN_ID: chainId, BASE_HPY } = require('../../../constants');

import { addressBook } from '../../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../../utils/contractHelper';
const {
  fuse: {
    platforms: {
      fuseNetwork: { rewarder, staker },
    },
    tokens: { WFUSE },
  },
} = addressBook;

const BLOCKS_PER_DAY = 17280; // 5 Second Block Times
const beefyPerformanceFee = 0.045;

const getFuseBeefySingleApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.times(0.85).dividedBy(totalStakedInUsd);
  const apy = compound(apr, BASE_HPY, 1, 0.955);

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
  const web3 = web3Factory(chainId);

  const rewardPool = getContractWithProvider(Rewarder, rewarder, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.getBlockRewardAmount().call());
  const yearlyRewards = rewardRate.times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.dividedBy(getEDecimals(WFUSE.decimals));

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(chainId);

  const stakerContract = getContractWithProvider(Staker, staker, web3);
  const totalStaked = new BigNumber(await stakerContract.methods.totalStakeAmount().call());

  return totalStaked.dividedBy(getEDecimals(WFUSE.decimals));
};

module.exports = getFuseBeefySingleApy;
