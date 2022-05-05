const BigNumber = require('bignumber.js');
const { bscWeb3: web3, web3Factory } = require('../../../../utils/web3');

const IRewardPool = require('../../../../abis/IRewardPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const ERC20 = require('../../../../abis/ERC20.json');

import { addressBook } from '../../../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../../../utils/contractHelper';
const {
  bsc: {
    tokens: { CAKE, beCAKE },
  },
} = addressBook;

const REWARDS = '0x49fAfAA2d9E32A6Af37A11cEeC50D76A772390Cc';
const ORACLE = 'tokens';
const ORACLE_ID = 'Cake';
const DECIMALS = '1e18';

const getbeCakeEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-becake-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-becake-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: 'Cake' });

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(56);

  const tokenContract = getContractWithProvider(ERC20, beCAKE.address, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeCakeEarnApy;
