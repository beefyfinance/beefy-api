import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../packages/address-book/address-book';
import IRewardPool from '../../../abis/IRewardPool';
import fetchPrice from '../../../utils/fetchPrice';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

export const getBifiGovApr = async (
  chainId: ChainId,
  chain: string,
  rewardOracleId: string,
  rewardDecimals: string,
  rewardPoolAddress: `0x${string}`,
  bifiAddress: `0x${string}`,
  rewardRateNumerator: number,
  rewardRateDenominator: number,
  blocksPerDay: number
) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(
      chainId,
      rewardOracleId,
      rewardPoolAddress,
      blocksPerDay,
      rewardRateNumerator,
      rewardRateDenominator,
      rewardDecimals
    ),
    getTotalStakedInUsd(chainId, bifiAddress, rewardPoolAddress),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).toNumber();
  //bsc bifi gov is named bifi-gov
  const name = `${chain ? `${chain}-` : ''}bifi-gov`;
  return {
    apys: {
      [name]: apr,
    },
    apyBreakdowns: {
      [name]: {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async (
  chainId: ChainId,
  oracleId: string,
  rewardPoolAddress: `0x${string}`,
  blocksPerDay,
  rewardRateNumerator: number,
  rewardRateDenominator: number,
  rewardDecimals: string
) => {
  const onePrice = await fetchPrice({ oracle: 'tokens', id: oracleId });

  const rewardPool = fetchContract(rewardPoolAddress, IRewardPool, chainId);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const yearlyRewards = rewardRate
    .times(rewardRateNumerator)
    .times(blocksPerDay)
    .dividedBy(rewardRateDenominator);
  const yearlyRewardsInUsd = yearlyRewards.times(onePrice).dividedBy(rewardDecimals);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (
  chainId: ChainId,
  bifiAddress: `0x${string}`,
  rewardAddress: `0x${string}`
) => {
  const tokenContract = fetchContract(bifiAddress, ERC20Abi, chainId);
  const totalStaked = new BigNumber(
    (await tokenContract.read.balanceOf([rewardAddress])).toString()
  );
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BIFI' });
  return totalStaked.times(tokenPrice).dividedBy('1e18');
};
