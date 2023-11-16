const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const { DAILY_HPY, ETH_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getAuraData } from './getAuraApys';
import AuraGauge from '../../../abis/ethereum/AuraGauge';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const {
  ethereum: {
    tokens: { BAL, AURA, bbaUSD, auraBAL },
  },
} = addressBook;

const ORACLE = 'tokens';
const auraBalGauge = '0x00A7BA8Ae7bca0B10A32Ea1f8e2a1Da980c6CAd2';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAuraBalApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const beefyPerformanceFee = getTotalPerformanceFeeForVault('aura-auraBal');
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const apy = compound(apr, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);

  return {
    apys: {
      'aura-aurabal': apy,
    },
    apyBreakdowns: {
      'aura-aurabal': {
        vaultApr: apr,
        totalApy: apy,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const balPrice = await fetchPrice({ oracle: ORACLE, id: BAL.oracleId });
  const auraPrice = await fetchPrice({ oracle: ORACLE, id: AURA.oracleId });
  const bbaUSDPrice = await fetchPrice({ oracle: ORACLE, id: bbaUSD.oracleId });

  const rewardPool = fetchContract(auraBalGauge, AuraGauge, ETH_CHAIN_ID);
  const bbaUSDVirtualGaugeAddress = await rewardPool.read.extraRewards([0]);

  const bbaUSDVirtualGauge = fetchContract(bbaUSDVirtualGaugeAddress, AuraGauge, ETH_CHAIN_ID);
  const [balRewardRate, bbaUSDRewardRate, auraData] = await Promise.all([
    rewardPool.read.rewardRate().then(res => new BigNumber(res.toString())),
    bbaUSDVirtualGauge.read.rewardRate().then(res => new BigNumber(res.toString())),
    getAuraData(),
  ]);

  const yearlyRewards = balRewardRate.times(3).times(BLOCKS_PER_DAY).times(365);

  let auraYearlyRewards = yearlyRewards.times(auraData[0]).dividedBy(auraData[1]);
  // e.g. amtTillMax = 5e25 - 1e25 = 4e25

  if (auraYearlyRewards.gte(auraData[2])) {
    auraYearlyRewards = auraData[2];
  }

  let bbausdYearlyRewards = bbaUSDRewardRate.times(3).times(BLOCKS_PER_DAY).times(365);

  const balYearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy(DECIMALS);
  const auraYearlyRewardsInUsd = auraYearlyRewards.times(auraPrice).dividedBy(DECIMALS);
  const bbaUSDYearlyRewardsInUsd = bbausdYearlyRewards.times(bbaUSDPrice).dividedBy(DECIMALS);

  const yearlyRewardsInUsd = balYearlyRewardsInUsd
    .plus(auraYearlyRewardsInUsd)
    .plus(bbaUSDYearlyRewardsInUsd);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(auraBAL.address, ERC20Abi, ETH_CHAIN_ID);
  const totalStaked = new BigNumber(
    (await tokenContract.read.balanceOf([auraBalGauge])).toString()
  );
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: auraBAL.oracleId });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getAuraBalApy;
