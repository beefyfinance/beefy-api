import { partition } from 'lodash-es';
import type { ChainId } from '../../../../packages/address-book/src/address-book/index.ts';
import { DAILY_HPY } from '../../../constants.ts';
import { isDefined } from '../../../utils/array.ts';
import { type ApiChain, fromChainId, toChainId } from '../../../utils/chain.ts';
import { envBoolean } from '../../../utils/env.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import type { OptionalRecord } from '../../../utils/object.ts';
import { getCowVaultsMeta } from '../../cowcentrated/getCowVaultsMeta.ts';
import { getCowProviderForClm } from '../../cowcentrated/providers.ts';
import {
  type AnyCowClmMeta,
  type CowClmWithRewardPoolMeta,
  isCowClmWithRewardPoolMeta,
  isCowClmWithVaultMeta,
} from '../../cowcentrated/types.ts';
import { getCampaignsForChain } from '../../offchain-rewards/index.ts';
import type { Campaign } from '../../offchain-rewards/types.ts';
import { getIgnitionAprs, type IgnitionAprs } from '../linea/getIgnitionAprs.ts';
import { type ApyBreakdownRequest, type ApyBreakdownResult, getApyBreakdown } from './getApyBreakdownNew.ts';
import { getBeefyRewardPoolV2Apr } from './getBeefyRewardPoolV2Apr.ts';

const logger = getLoggerFor({ module: 'apy' });

type OffchainVaultApr = {
  total: number;
  byProvider: OptionalRecord<Campaign['providerId'] | 'lineaIgnition', number>;
};

type RewardPoolApr = {
  rewardPool: number;
  rewardPoolTrading?: number;
  total: number;
};

const THROW_ON_EMPTY_COW_META: boolean = envBoolean('THROW_ON_EMPTY_COW_META', true);

/**
 * Base CLMs + Reward Pools
 */
export const getCowApys = async (apiChain: ApiChain) => {
  const clms = getCowVaultsMeta(apiChain);
  if (!clms.length) {
    if (THROW_ON_EMPTY_COW_META) {
      throw new Error(`No clms found for ${apiChain}`);
    } else return {};
  }

  const offchainCampaignsByVault = await getOffchainCampaignsByVault(apiChain, clms);
  const chainId = toChainId(apiChain);
  const [clmBreakdownsResult, rewardPoolAprsResult] = await Promise.allSettled([
    getCowClmApyBreakdown(clms, offchainCampaignsByVault),
    getCowRewardPoolAprs(chainId, clms),
  ]);

  if (clmBreakdownsResult.status === 'rejected') {
    throw new Error(`Failed to get clm apy breakdowns for ${apiChain}: ${clmBreakdownsResult.reason}`);
  }

  const clmBreakdowns = clmBreakdownsResult.value;
  if (rewardPoolAprsResult.status === 'rejected') {
    logger.warn({ chain: apiChain, err: rewardPoolAprsResult.reason }, 'failed to get clm reward pool aprs');
    // keep clm data even if reward pool data is missing
    return clmBreakdowns;
  }

  const rewardPoolAprs = rewardPoolAprsResult.value;
  const rewardPoolBreakdowns = getCowRewardPoolApyBreakdown(
    clms,
    clmBreakdowns,
    rewardPoolAprs,
    offchainCampaignsByVault
  );

  if (!rewardPoolBreakdowns) {
    // this just means none of the CLMs had reward pools defined in config
    return clmBreakdowns;
  }

  // Merge reward pool breakdowns into clm breakdowns
  clmBreakdowns.apys = { ...clmBreakdowns.apys, ...rewardPoolBreakdowns.apys };
  clmBreakdowns.apyBreakdowns = {
    ...clmBreakdowns.apyBreakdowns,
    ...rewardPoolBreakdowns.apyBreakdowns,
  };

  const vaultBreakdowns = getCowVaultApyBreakdown(clms, clmBreakdowns);
  if (!vaultBreakdowns) {
    // this just means none of the CLMs had vaults defined in config
    return clmBreakdowns;
  }

  // Merge vault breakdowns into clm + reward pool breakdowns
  return {
    apys: { ...clmBreakdowns.apys, ...vaultBreakdowns.apys },
    apyBreakdowns: { ...clmBreakdowns.apyBreakdowns, ...vaultBreakdowns.apyBreakdowns },
  };
};

async function getOffchainCampaignsByVault(
  apiChain: ApiChain,
  clms: AnyCowClmMeta[]
): Promise<Record<string, OffchainVaultApr>> {
  const [campaigns, lineaIgnition] = await Promise.all([
    getCampaignsForChain(apiChain),
    apiChain === 'linea' ? getIgnitionAprs('Etherex') : Promise.resolve({} as IgnitionAprs),
  ]);
  const byVaultId: Record<string, OffchainVaultApr> = {};

  if (campaigns) {
    for (const campaign of campaigns) {
      if (campaign.active) {
        for (const vault of campaign.vaults) {
          if (vault.apr > 0) {
            byVaultId[vault.id] ??= { total: 0, byProvider: {} };
            byVaultId[vault.id].byProvider[campaign.providerId] ??= 0;

            byVaultId[vault.id].total += vault.apr;
            byVaultId[vault.id].byProvider[campaign.providerId] += vault.apr;
          }
        }
      }
    }
  }

  if (apiChain === 'linea') {
    // linea ignition manual claims
    for (const clm of clms) {
      const ignitionApr = lineaIgnition[clm.lpAddress];
      if (ignitionApr && ignitionApr > 0) {
        const vaultIds = [clm.oracleId];
        if (isCowClmWithRewardPoolMeta(clm)) {
          vaultIds.push(clm.rewardPool.oracleId);
        }
        if (isCowClmWithVaultMeta(clm)) {
          vaultIds.push(clm.vault.oracleId);
        }

        for (const vaultId of vaultIds) {
          byVaultId[vaultId] ??= { total: 0, byProvider: {} };
          byVaultId[vaultId].byProvider['lineaIgnition'] ??= 0;

          byVaultId[vaultId].total += ignitionApr;
          byVaultId[vaultId].byProvider['lineaIgnition'] += ignitionApr;
        }
      }
    }
  }

  return byVaultId;
}

function getCowVaultApyBreakdown(
  clms: AnyCowClmMeta[],
  clmBreakdowns: ApyBreakdownResult
): ApyBreakdownResult | undefined {
  const inputs = clms
    .map((clm): ApyBreakdownRequest | undefined => {
      if (isCowClmWithVaultMeta(clm)) {
        const clmPoolBreakdown = clmBreakdowns.apyBreakdowns[clm.rewardPool.oracleId];
        let merklApr = clmPoolBreakdown?.merklApr || 0;
        if (clm.vault.excludeMerkl) merklApr = 0;

        return {
          vaultId: clm.vault.oracleId,
          clm: clm.apr,
          vault:
            (clmPoolBreakdown?.rewardPoolApr || 0)
            + (clmPoolBreakdown?.rewardPoolTradingApr || 0)
            + merklApr
            + (clmPoolBreakdown?.stellaSwapApr || 0),
          lineaIgnition: clmPoolBreakdown?.lineaIgnitionApr, // user claims
          compoundingsPerYear: DAILY_HPY,
        };
      }
      return undefined;
    })
    .filter(isDefined);

  return inputs.length ? getApyBreakdown(inputs) : undefined;
}

function getCowRewardPoolApyBreakdown(
  clms: AnyCowClmMeta[],
  clmBreakdowns: ApyBreakdownResult,
  rewardPoolAprs: (RewardPoolApr | undefined)[],
  offchainById: Record<string, OffchainVaultApr>
): ApyBreakdownResult | undefined {
  const inputs = clms
    .map((clm, index): ApyBreakdownRequest | undefined => {
      if (isCowClmWithRewardPoolMeta(clm)) {
        const clmBreakdown = clmBreakdowns.apyBreakdowns[clm.oracleId];
        const poolApr = rewardPoolAprs[index];
        const offchainAprs = offchainById[clm.rewardPool.oracleId];

        return {
          vaultId: clm.rewardPool.oracleId,
          beefyFee: 0,
          rewardPool: poolApr?.rewardPool || 0,
          rewardPoolTrading: poolApr?.rewardPoolTrading || undefined,
          clm: clmBreakdown?.clmApr || undefined, // after fee from CLM; reward pool fee = 0; so this works
          merkl: offchainAprs?.byProvider.merkl || undefined, // we can't copy from CLM in case it is not forwarded correctly
          stellaSwap: offchainAprs?.byProvider.stellaswap || undefined,
          lineaIgnition: offchainAprs?.byProvider.lineaIgnition || undefined,
          compoundingsPerYear: DAILY_HPY,
        };
      }
      return undefined;
    })
    .filter(isDefined);

  return inputs.length ? getApyBreakdown(inputs) : undefined;
}

const getCowRewardPoolAprs = async (
  chainId: ChainId,
  clms: AnyCowClmMeta[]
): Promise<(RewardPoolApr | undefined)[]> => {
  const resolveUndefined = Promise.resolve(undefined);
  return Promise.all(
    clms.map(clm => (isCowClmWithRewardPoolMeta(clm) ? getCowRewardPoolApr(chainId, clm) : resolveUndefined))
  );
};

const getCowRewardPoolApr = async (
  chainId: ChainId,
  clm: CowClmWithRewardPoolMeta
): Promise<RewardPoolApr | undefined> => {
  try {
    const rewardPoolData = await getBeefyRewardPoolV2Apr(chainId, {
      oracleId: clm.rewardPool.oracleId,
      address: clm.rewardPool.address,
      stakedToken: {
        oracleId: clm.oracleId,
        address: clm.address,
        decimals: 18,
      },
      rewards: clm.rewardPool.rewards,
    });
    const result: RewardPoolApr = {
      rewardPool: 0,
      total: 0,
    };

    if (!rewardPoolData) {
      logger.warn({ chain: chainId, vault: clm.rewardPool.oracleId }, 'getBeefyRewardPoolV2Apr returned undefined');
      return result;
    }

    result.rewardPool = result.total = rewardPoolData.totalApr;

    const provider = getCowProviderForClm(clm);
    if (!provider) {
      return result;
    }

    const tradingRewardTokens = provider.poolTradingRewardTokens?.[fromChainId(chainId)];
    if (!tradingRewardTokens || tradingRewardTokens.length === 0) {
      return result;
    }

    const tradingRewardAddresses = new Set(tradingRewardTokens.map(token => token.address));
    const [tradingRewards, poolRewards] = partition(rewardPoolData.rewardsApr, reward =>
      tradingRewardAddresses.has(reward.address)
    );
    const rewardPoolTrading = tradingRewards.reduce((sum, reward) => sum + reward.apr, 0);
    const rewardPool = poolRewards.reduce((sum, reward) => sum + reward.apr, 0);
    const total = rewardPool + rewardPoolTrading;

    return {
      rewardPool,
      rewardPoolTrading,
      total,
    };
  } catch (err) {
    logger.warn({ chain: chainId, vault: clm.rewardPool.oracleId, err }, 'reward pool apr calculation failed');
    return undefined;
  }
};

const getCowClmApyBreakdown = async (
  clms: AnyCowClmMeta[],
  offchainById: Record<string, OffchainVaultApr>
): Promise<ApyBreakdownResult> => {
  return getApyBreakdown(
    clms.map(clm => ({
      vaultId: clm.oracleId,
      clm: clm.apr,
      merkl: offchainById[clm.oracleId]?.byProvider.merkl || undefined,
      stellaSwap: offchainById[clm.oracleId]?.byProvider.stellaswap || undefined,
      lineaIgnition: offchainById[clm.oracleId]?.byProvider.lineaIgnition || undefined,
      compoundingsPerYear: DAILY_HPY,
    }))
  );
};
