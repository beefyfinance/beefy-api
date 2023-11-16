const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
import { addressBook } from '../../../../packages/address-book/address-book';
import ERC20Abi from '../../../abis/ERC20Abi';
import IRewardPool from '../../../abis/IRewardPool';
import { POLYGON_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
const {
  polygon: {
    tokens: { QI, beQI },
  },
} = addressBook;

const REWARDS = '0x5D060698F179E7D2233480A44d6D3979e4Ae9e7f';
const ORACLE = 'tokens';
const ORACLE_ID = QI.oracleId;
const DECIMALS = '1e18';

const getbeQiEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-beqi-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-beqi-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: 'QI' });

  const rewardPool = fetchContract(REWARDS, IRewardPool, POLYGON_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(beQI.address, ERC20Abi, POLYGON_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([REWARDS])).toString());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeQiEarnApy;
