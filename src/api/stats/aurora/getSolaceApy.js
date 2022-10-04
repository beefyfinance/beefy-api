const BigNumber = require('bignumber.js');
const { web3Factory } = require('../../../utils/web3');

const Rewarder = require('../../../abis/aurora/SolaceRewards.json');
const { compound } = require('../../../utils/compound');

import { getEDecimals } from '../../../utils/getEDecimals';
const { AURORA_CHAIN_ID: chainId, BASE_HPY } = require('../../../constants');

import { addressBook } from '../../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const {
  aurora: {
    platforms: {
      solace: { rewards },
    },
    tokens: { SOLACE },
  },
} = addressBook;

const SECONDS_PER_DAY = 86400; // Per Second Rewards

const getSolaceApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const beefyPerformanceFee = getTotalPerformanceFeeForVault('solace-solace');
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(apr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

  return {
    apys: {
      'solace-solace': apy,
    },
    apyBreakdowns: {
      'solace-solace': {
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

  const rewardPool = getContractWithProvider(Rewarder, rewards, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardPerSecond().call());
  const yearlyRewards = rewardRate.times(SECONDS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.dividedBy(getEDecimals(SOLACE.decimals));

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(chainId);

  const rewardPool = getContractWithProvider(Rewarder, rewards, web3);
  const totalStaked = new BigNumber(await rewardPool.methods.valueStaked().call());

  return totalStaked.dividedBy(getEDecimals(SOLACE.decimals));
};

module.exports = getSolaceApy;
