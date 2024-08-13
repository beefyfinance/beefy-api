import { ChainId } from '../../../packages/address-book/src/address-book';
import { ApiChain, toAppChain } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import BeefyBoostAbi from '../../abis/BeefyBoost';
import { IBeefyRewardPool } from '../../abis/IBeefyRewardPool';
import { Boost, BoostConfig } from './types';
import { bigintRange } from '../../utils/array';
import { bigintToNumber } from '../../utils/big-int';

type BoostConfigRaw = Omit<BoostConfig, 'version' | 'chain'> & {
  version?: number;
};

export const getBoosts = async (chain: ApiChain): Promise<BoostConfig[]> => {
  const boostsEndpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/boost/${toAppChain(
    chain
  )}.json`;
  const response = await fetch(boostsEndpoint);
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch boosts for ${chain}: ${response.status} ${response.statusText}`
    );
  }

  const boosts = await response.json();
  if (!boosts || !Array.isArray(boosts)) {
    throw new Error(`Invalid boosts data for ${chain}`);
  }

  return (boosts as BoostConfigRaw[]).map(b => ({
    ...b,
    version: b.version || 1,
    chain,
  }));
};

export const getBoostPeriodFinish = async (
  chain: ApiChain,
  boosts: BoostConfig[]
): Promise<Boost[]> => {
  const chainId = ChainId[chain];
  const periodFinishCalls = boosts.map(async (boost): Promise<number[]> => {
    if (boost.version >= 2) {
      const poolContract = fetchContract(boost.earnContractAddress, IBeefyRewardPool, chainId);
      const numRewards = await poolContract.read.rewardsLength();
      if (numRewards === 0n) {
        return [];
      }

      return await Promise.all(
        bigintRange(numRewards).map(async (rewardId): Promise<number> => {
          const rewardInfo = await poolContract.read.rewardInfo([rewardId]);
          return bigintToNumber(rewardInfo[1]);
        })
      );
    }

    const boostContract = fetchContract(boost.earnContractAddress, BeefyBoostAbi, chainId);
    return [bigintToNumber(await boostContract.read.periodFinish())];
  });

  const periodFinishes = await Promise.all(periodFinishCalls);
  return boosts.map((boost, i) => ({
    ...boost,
    periodFinish: periodFinishes[i].length ? Math.max(...periodFinishes[i]) : 0,
    periodFinishes: periodFinishes[i],
  }));
};
