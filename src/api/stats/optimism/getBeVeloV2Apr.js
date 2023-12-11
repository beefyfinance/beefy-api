const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { OPTIMISM_CHAIN_ID } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import ERC20Abi from '../../../abis/ERC20Abi';
import IRewardPool from '../../../abis/IRewardPool';
import { fetchContract } from '../../rpc/client';
const {
  optimism: {
    tokens: { beVELO },
  },
} = addressBook;

const ORACLE = 'tokens';
const ORACLE_ID = 'BeVELO';
const REWARD_ORACLE = 'VELOV2';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;
const rewards = '0x2489F2f7f972cA7eE6436666A3Ab0AAFB5A06c7b';

const getBeVeloV2Apr = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-bevelo-v2-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-bevelo-v2-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const nativePrice = await fetchPrice({ oracle: ORACLE, id: REWARD_ORACLE });

  const rewardPool = fetchContract(rewards, IRewardPool, OPTIMISM_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(nativePrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(beVELO.address, ERC20Abi, OPTIMISM_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([rewards])).toString());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getBeVeloV2Apr;
