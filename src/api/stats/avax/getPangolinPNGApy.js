const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
const { DAILY_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { default: IRewardPool } = require('../../../abis/IRewardPool');
const { fetchContract } = require('../../rpc/client');
const { default: ERC20Abi } = require('../../../abis/ERC20Abi');

const PNG = '0x60781C2586D68229fde47564546784ab3fACA982';
const REWARDS = '0x88afdaE1a9F58Da3E68584421937E5F564A0135b';
const ORACLE = 'tokens';
const ORACLE_ID = 'PNG';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getPangolinPNGApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('png-png');
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);

  return { 'png-png': apy };
};

const getYearlyRewardsInUsd = async () => {
  const pngPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  const rewardPool = fetchContract(REWARDS, IRewardPool, AVAX_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(pngPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(PNG, ERC20Abi, AVAX_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([REWARDS])).toString());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getPangolinPNGApy;
