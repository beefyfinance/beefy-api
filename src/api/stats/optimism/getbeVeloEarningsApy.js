const BigNumber = require('bignumber.js');
const { optimismWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');

import { addressBook } from '../../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../../utils/contractHelper';
const {
  optimism: {
    tokens: { VELO, beVELO },
  },
} = addressBook;

const REWARDS = '0x7680639E51155a2C7C9cC98872f0c12A15990241';
const ORACLE = 'tokens';
const ORACLE_ID = VELO.symbol;
const DECIMALS = '1e18';

const getbeVeloEarnApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'beefy-bevelo-earnings': apr,
    },
    apyBreakdowns: {
      'beefy-bevelo-earnings': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: 'VELO' });

  const rewardPool = getContractWithProvider(IRewardPool, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const secondsPerYear = 31536000;
  const yearlyRewards = rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(10);

  const tokenContract = getContractWithProvider(ERC20, beVELO.address, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getbeVeloEarnApy;
