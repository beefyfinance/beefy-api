const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { default: IRewardPool } = require('../../../abis/IRewardPool');
const { fetchContract } = require('../../rpc/client');
const { OPTIMISM_CHAIN_ID } = require('../../../constants');
const { default: ERC20Abi } = require('../../../abis/ERC20Abi');

const stakingToken = '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0';
const RewardPool = '0x96f990d1aAF83B09a4BA3D22cAab0377a058C84f';
const ORACLE = 'tokens';
const ORACLE_ID = 'beOPX';
const DECIMALS = '1e18';

const getBeOpxEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-beopx-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-beopx-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const rewardPrice = await fetchPrice({ oracle: ORACLE, id: 'WETH' });

  const rewardPool = fetchContract(RewardPool, IRewardPool, OPTIMISM_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(rewardPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(stakingToken, ERC20Abi, OPTIMISM_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([RewardPool])).toString());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getBeOpxEarnApy;
