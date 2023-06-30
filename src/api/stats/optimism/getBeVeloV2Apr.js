const BigNumber = require('bignumber.js');
const { optimismWeb3: web3, web3Factory } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import IRewardPool from '../../../abis/IRewardPool';
import { getContractWithProvider } from '../../../utils/contractHelper';
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

  const rewardPool = getContractWithProvider(IRewardPool, rewards, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(nativePrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(chainId);

  const tokenContract = getContractWithProvider(ERC20, beVELO.address, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(rewards).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getBeVeloV2Apr;
