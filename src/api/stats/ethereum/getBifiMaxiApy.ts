import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import { IBeefyRewardPool } from '../../../abis/IBeefyRewardPool.ts';
import { ETH_CHAIN_ID } from '../../../constants.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';

const secondsPerYear = 31536000;
const {
  ethereum: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { BIFI },
  },
} = addressBook;

const rewards = [
  {
    symbol: 'ETH',
    id: 0,
    decimals: '1e18',
  },
];

export const getBifiMaxiApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([getYearlyRewardsInUsd(), getTotalStakedInUsd()]);
  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return getApyBreakdown([
    {
      vaultId: 'bifi-vault',
      beefyFee: 0.005,
      vault: apr,
    },
    {
      vaultId: 'bifi-pool',
      beefyFee: 0,
      rewardPool: apr,
    },
  ]);
};

const getYearlyRewardsInUsd = async () => {
  let yearlyRewards = new BigNumber(0);
  const rewardPoolContract = fetchContract(rewardPool, IBeefyRewardPool, ETH_CHAIN_ID);
  for (let i = 0; i < rewards.length; ++i) {
    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewards[i].symbol });
    const rewardInfo = await rewardPoolContract.read.rewardInfo([BigInt(rewards[i].id)]);
    const rewardRate = new BigNumber(rewardInfo[4]);
    const periodFinish = new BigNumber(rewardInfo[1]);
    if (periodFinish.isGreaterThan(Math.floor(Date.now() / 1000))) {
      yearlyRewards = yearlyRewards.plus(
        rewardRate.times(secondsPerYear).times(rewardPrice).dividedBy(rewards[i].decimals)
      );
    }
  }
  return yearlyRewards;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(BIFI.address, ERC20Abi, ETH_CHAIN_ID);
  const totalStaked = new BigNumber(await tokenContract.read.balanceOf([rewardPool as Address]));
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BIFI' });

  return totalStaked.times(tokenPrice).dividedBy('1e18');
};
