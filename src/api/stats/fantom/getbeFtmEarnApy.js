const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { default: IRewardPool } = require('../../../abis/IRewardPool');
const { fetchContract } = require('../../rpc/client');
const { default: ERC20Abi } = require('../../../abis/ERC20Abi');
const { FANTOM_CHAIN_ID } = require('../../../constants');

const beFTM = '0x7381eD41F6dE418DdE5e84B55590422a57917886';
const REWARDS = '0xE00D25938671525C2542A689e42D1cfA56De5888';
const ORACLE = 'tokens';
const ORACLE_ID = 'beFTM';
const DECIMALS = '1e18';

const getbeFtmEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-beFTM-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-beFTM-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const fantomPrice = await fetchPrice({ oracle: ORACLE, id: 'WFTM' });
  const rewardPool = fetchContract(REWARDS, IRewardPool, FANTOM_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(fantomPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(beFTM, ERC20Abi, FANTOM_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([REWARDS])).toString());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeFtmEarnApy;
