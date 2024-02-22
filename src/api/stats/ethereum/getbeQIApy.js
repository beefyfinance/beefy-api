const BigNumber = require('bignumber.js');
import IBeefyRewardPool from '../../../abis/IBeefyRewardPool';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import { addressBook } from '../../../../packages/address-book/address-book';
import { ETH_CHAIN_ID } from '../../../constants';
import { fetchPrice } from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
const secondsPerYear = 31536000;
const {
  ethereum: {
    tokens: { beQI },
  },
} = addressBook;

const rewards = [
  {
    symbol: 'beQIv2',
    id: 0,
    decimals: '1e18',
  },
];

const rewardPool = '0x5e3E4ED40E754254095F091aA51871D125F4380a';

export const getbeQIApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return getApyBreakdown(
    [
      // { name: 'beqi-vault', address: 'beqi-vault', beefyFee: 0.005 },
      { name: 'beqiv2-pool', address: 'beqiv2-pool', beefyFee: 0 },
    ],
    {},
    [apr],
    0
  );
};

const getYearlyRewardsInUsd = async () => {
  let yearlyRewards = new BigNumber(0);
  const rewardPoolContract = fetchContract(rewardPool, IBeefyRewardPool, ETH_CHAIN_ID);
  for (let i = 0; i < rewards.length; ++i) {
    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewards[i].symbol });
    const rewardInfo = await rewardPoolContract.read.rewardInfo([rewards[i].id]);
    const rewardRate = new BigNumber(rewardInfo[4].toString());
    const periodFinish = new BigNumber(rewardInfo[1].toString());
    if (periodFinish.isGreaterThan(Math.floor(Date.now() / 1000))) {
      yearlyRewards = yearlyRewards.plus(
        rewardRate.times(secondsPerYear).times(rewardPrice).dividedBy(rewards[i].decimals)
      );
    }
  }
  return yearlyRewards;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(beQI.address, ERC20Abi, ETH_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([rewardPool])).toString());
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'beQIv2' });

  return totalStaked.times(tokenPrice).dividedBy('1e18');
};
