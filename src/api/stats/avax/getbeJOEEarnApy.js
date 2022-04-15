const BigNumber = require('bignumber.js');
const { avaxWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  avax: {
    tokens: { JOE, beJOE },
  },
} = addressBook;

const REWARDS = '0x2E360492120cebeB2527c41BAE1a4f21992D86Ec';
const ORACLE = 'tokens';
const ORACLE_ID = JOE.symbol;
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

  const rewardPool = new web3.eth.Contract(IRewardPool, REWARDS);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(joePrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(43114);

  const tokenContract = new web3.eth.Contract(ERC20, beJOE.address);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeJOEEarnApy;
