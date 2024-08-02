import { ChainId } from '../../../../packages/address-book/src/address-book';
import { ApiChain, toChainId } from '../../../utils/chain';
import { getCowVaultsMeta } from '../../cowcentrated/getCowVaultsMeta';
import {
  type AnyCowClmMeta,
  type CowClmWithRewardPoolMeta,
  isCowClmWithRewardPoolMeta,
  isCowClmWithVaultMeta,
} from '../../cowcentrated/types';
import { isDefined } from '../../../utils/array';
import { getBeefyRewardPoolV2Apr } from './getBeefyRewardPoolV2Apr';
import { ApyBreakdownRequest, ApyBreakdownResult, getApyBreakdown } from './getApyBreakdownNew';
import { DAILY_HPY } from '../../../constants';
import { getCampaignsForChain } from '../../offchain-rewards';
import { Campaign } from '../../offchain-rewards/types';
import { OptionalRecord } from '../../../utils/object';

type OffchainVaultApr = {
  total: number;
  byProvider: OptionalRecord<Campaign['providerId'], number>;
};

/**
 * Base CLMs + Reward Pools
 */
export const getCowApys = async (apiChain: ApiChain) => {
  const clms = getCowVaultsMeta(apiChain);
  if (!clms.length) {
    throw new Error(`No clms found for ${apiChain}`);
  }

  const offchainCampaignsByVault = await getOffchainCampaignsByVault(apiChain);
  const chainId = toChainId(apiChain);
  const [clmBreakdownsResult, rewardPoolAprsResult] = await Promise.allSettled([
    getCowClmApyBreakdown(clms, offchainCampaignsByVault),
    getCowRewardPoolAprs(chainId, clms),
  ]);

  if (clmBreakdownsResult.status === 'rejected') {
    throw new Error(
      `Failed to get clm apy breakdowns for ${apiChain}: ${clmBreakdownsResult.reason}`
    );
  }

  const clmBreakdowns = clmBreakdownsResult.value;
  if (rewardPoolAprsResult.status === 'rejected') {
    console.error(
      `Failed to get clm reward pool aprs for ${apiChain}: ${rewardPoolAprsResult.reason}`
    );
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
  apiChain: ApiChain
): Promise<Record<string, OffchainVaultApr>> {
  const campaigns = await getCampaignsForChain(apiChain);
  if (!campaigns) {
    return {};
  }

  const byVaultId: Record<string, OffchainVaultApr> = {};
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

  return byVaultId;
}

function getCowVaultApyBreakdown(
  clms: AnyCowClmMeta[],
  clmBreakdowns: ApyBreakdownResult
): ApyBreakdownResult | undefined {
  const inputs = clms
    .map((clm, index): ApyBreakdownRequest | undefined => {
      if (isCowClmWithVaultMeta(clm)) {
        const clmBreakdown = clmBreakdowns.apyBreakdowns[clm.oracleId];
        const rewardPoolBreakdown = clmBreakdowns.apyBreakdowns[clm.rewardPool.oracleId];

        return {
          vaultId: clm.vault.oracleId,
          vault:
            (clmBreakdown?.clmApr || 0) + // TODO clmApr already has fee removed
            (rewardPoolBreakdown?.merklApr || 0) +
            (rewardPoolBreakdown?.stellaSwapApr || 0) +
            (rewardPoolBreakdown?.rewardPoolApr || 0),
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
  clmApys: ApyBreakdownResult,
  rewardPoolAprs: (number | undefined)[],
  offchainById: Record<string, OffchainVaultApr>
): ApyBreakdownResult | undefined {
  const inputs = clms
    .map((clm, index): ApyBreakdownRequest | undefined => {
      if (isCowClmWithRewardPoolMeta(clm)) {
        return {
          vaultId: clm.rewardPool.oracleId,
          beefyFee: 0,
          rewardPool: rewardPoolAprs[index],
          clm: clmApys.apyBreakdowns[clm.oracleId]?.clmApr, // after fee from CLM; reward pool fee = 0; so this works
          merkl: offchainById[clm.rewardPool.oracleId]?.byProvider.merkl || undefined, // we can't copy from CLM in case it is not forwarded correctly
          stellaSwap: offchainById[clm.rewardPool.oracleId]?.byProvider.stellaswap || undefined,
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
): Promise<(number | undefined)[]> => {
  const resolveUndefined = Promise.resolve(undefined);
  return Promise.all(
    clms.map(clm =>
      isCowClmWithRewardPoolMeta(clm) ? getCowRewardPoolApr(chainId, clm) : resolveUndefined
    )
  );
};

const getCowRewardPoolApr = async (
  chainId: ChainId,
  clm: CowClmWithRewardPoolMeta
): Promise<number | undefined> => {
  try {
    const result = await getBeefyRewardPoolV2Apr(chainId, {
      oracleId: clm.rewardPool.oracleId,
      address: clm.rewardPool.address,
      stakedToken: {
        oracleId: clm.oracleId,
        address: clm.address,
        decimals: 18,
      },
      rewards: clm.rewardPool.rewards,
    });

    if (!result) {
      console.error(
        `> getCowRewardPoolApr Error for ${clm.rewardPool.oracleId}: getBeefyRewardPoolV2Apr returned undefined`
      );
      return 0;
    }

    return result.totalApr;
  } catch (err) {
    console.error(`> getCowRewardPoolApr Error for ${clm.rewardPool.oracleId}: ${err.message}`);
    return undefined;
  }
};

const getCowClmApyBreakdown = async (
  vaults: AnyCowClmMeta[],
  offchainById: Record<string, OffchainVaultApr>
): Promise<ApyBreakdownResult> => {
  return getApyBreakdown(
    vaults.map(
      (vault): ApyBreakdownRequest => ({
        vaultId: vault.oracleId,
        clm: vault.apr,
        merkl: offchainById[vault.oracleId]?.byProvider.merkl || undefined,
        stellaSwap: offchainById[vault.oracleId]?.byProvider.stellaswap || undefined,
        compoundingsPerYear: DAILY_HPY,
      })
    )
  );
};
