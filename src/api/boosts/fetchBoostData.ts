import BeefyBoostAbi from '../../abis/BeefyBoost.ts';
import { IBeefyRewardPool } from '../../abis/IBeefyRewardPool.ts';
import { fetchAppPromos } from '../../utils/appConfigs.ts';
import { bigintRange } from '../../utils/array.ts';
import { bigintToNumber } from '../../utils/big-int.ts';
import { type ApiChain, isAppChain, toChainId } from '../../utils/chain.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { fetchContract } from '../rpc/client.ts';
import type { Boost, BoostEntity, BoostPromoConfig, PromoConfig } from './types.ts';

const logger = getLoggerFor({ module: 'boosts' });

function isBoostPromo(promo: PromoConfig): promo is BoostPromoConfig {
  return promo.type === 'boost';
}

// promos json is unchecked, drop rewards whose chain is not supported
export function withSupportedRewards<T extends Pick<BoostPromoConfig, 'id' | 'rewards'>>(boost: T, chain: ApiChain): T {
  const allRewards = boost.rewards ?? [];
  const rewards = allRewards.filter(reward => {
    if (!reward.chainId || isAppChain(reward.chainId)) {
      return true;
    }
    logger.warn({ chain, boost: boost.id, rewardChain: reward.chainId }, 'skipping reward on unsupported chain');
    return false;
  });
  return boost.rewards && rewards.length === boost.rewards.length ? boost : { ...boost, rewards };
}

export const getBoosts = async (chain: ApiChain): Promise<BoostEntity[]> => {
  const promos = await fetchAppPromos(chain);
  return (promos as readonly PromoConfig[]).filter(isBoostPromo).map(
    (b): BoostEntity => ({
      ...withSupportedRewards(b, chain),
      version: b.version || 1,
      chain,
    })
  );
};

export const getBoostPeriodFinish = async (chain: ApiChain, boosts: BoostEntity[]): Promise<Boost[]> => {
  const chainId = toChainId(chain);
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
