const BigNumber = require('bignumber.js');
const { avaxWeb3: web3, web3Factory } = require('../../../utils/web3');
import { fetchPrice } from '../../../utils/fetchPrice';
import { addressBook } from '../../../../packages/address-book/address-book';
import ERC20Abi from '../../../abis/ERC20Abi';
import IRewardPool from '../../../abis/IRewardPool';
import { AVAX_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
const {
  avax: {
    tokens: { JOE, beJOE },
  },
} = addressBook;

const REWARDS = '0x2E360492120cebeB2527c41BAE1a4f21992D86Ec';
const ORACLE = 'tokens';
const ORACLE_ID = JOE.oracleId;
const DECIMALS = '1e18';

const getbeJOEEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-beJoe-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-beJoe-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const joePrice = await fetchPrice({ oracle: ORACLE, id: 'JOE' });

  const rewardPool = fetchContract(REWARDS, IRewardPool, AVAX_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(joePrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(beJOE.address, ERC20Abi, AVAX_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([REWARDS])).toString());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeJOEEarnApy;
