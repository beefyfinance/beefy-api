import { ChainId } from '../../../packages/address-book/src/address-book';
import { ApiChain, toAppChain } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import BeefyBoostAbi from '../../abis/BeefyBoost';
import { IBeefyRewardPool } from '../../abis/IBeefyRewardPool';
import { Boost, BoostEntity, BoostPromoConfig, PromoConfig } from './types';
import { bigintRange } from '../../utils/array';
import { bigintToNumber } from '../../utils/big-int';

function isBoostPromo(promo: PromoConfig): promo is BoostPromoConfig {
  return promo.type === 'boost';
}

export const getBoosts = async (chain: ApiChain): Promise<BoostEntity[]> => {
  const promosEndpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/promos/chain/${toAppChain(
    chain
  )}.json`;
  const response = await fetch(promosEndpoint);
  if (response.status === 404) {
    return []; // 0 boosts = OK
  }

  if (response.status !== 200) {
    throw new Error(`Failed to fetch boosts for ${chain}: ${response.status} ${response.statusText}`);
  }

  const promos = await response.json();
  if (!promos || !Array.isArray(promos)) {
    throw new Error(`Invalid promos data for ${chain}`);
  }

  return (promos as PromoConfig[]).filter(isBoostPromo).map(
    (b): BoostEntity => ({
      ...b,
      version: b.version || 1,
      chain,
    })
  );
};

export const getBoostPeriodFinish = async (chain: ApiChain, boosts: BoostEntity[]): Promise<Boost[]> => {
  const chainId = ChainId[chain];
  const periodFinishCalls = boosts.map(async (boost): Promise<number[]> => {
    if (boost.version >= 2) {
      const poolContract = fetchContract(boost.contractAddress, IBeefyRewardPool, chainId);
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

    const boostContract = fetchContract(boost.contractAddress, BeefyBoostAbi, chainId);
    return [bigintToNumber(await boostContract.read.periodFinish())];
  });

  const periodFinishes = await Promise.all(periodFinishCalls);
  return boosts.map((boost, i) => ({
    ...boost,
    periodFinish: periodFinishes[i].length ? Math.max(...periodFinishes[i]) : 0,
    periodFinishes: periodFinishes[i],
  }));
};
