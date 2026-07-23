import type { Context } from 'koa';
import { sortBy, uniqBy } from 'lodash-es';
import type { Address } from 'viem';
import { type AnyChain, isApiChain, toAppChain } from '../../utils/chain.ts';
import { createFactory } from '../../utils/factory.ts';
import { sendBadRequest, sendServiceUnavailable, sendSuccess } from '../../utils/koa.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { typedEntries } from '../../utils/object.ts';
import { serviceEventBus } from '../../utils/ServiceEventBus.ts';
import { getAllCowClmsByChain } from '../cowcentrated/getCowClms.ts';
import { isCowClmWithRewardPool, isCowClmWithVault } from '../cowcentrated/types.ts';
import { getVaultsByType } from '../stats/getMultichainVaults.ts';
import { OffchainRewards } from './OffchainRewards.ts';
import type { Campaign, CampaignsWithMeta, ProviderId, Vault } from './types.ts';

const logger = getLoggerFor({ module: 'rewards' });

const TIME_BETWEEN_UPDATES = 10 * 60; // seconds
const CACHE_KEY = 'OFFCHAIN_REWARDS';

const getVaultsWithOffchainRewards = createFactory((): Vault[] => {
  // CLM vaults
  const clmVaults: Vault[] = typedEntries(getAllCowClmsByChain()).flatMap(([apiChain, clms]) => {
    const chainId = toAppChain(apiChain);
    return clms.flatMap(clm => {
      const clmVaults: Vault[] = [
        {
          id: clm.oracleId,
          address: clm.address,
          poolAddress: clm.lpAddress,
          chainId,
          type: 'cowcentrated',
        },
      ];
      if (isCowClmWithRewardPool(clm)) {
        clmVaults.push({
          id: clm.rewardPool.oracleId,
          address: clm.rewardPool.address,
          poolAddress: clm.lpAddress,
          chainId,
          type: 'cowcentrated-pool',
        });
      }
      if (isCowClmWithVault(clm)) {
        clmVaults.push({
          id: clm.vault.oracleId,
          address: clm.vault.address,
          poolAddress: clm.lpAddress,
          chainId,
          type: 'cowcentrated-vault',
        });
      }
      return clmVaults;
    });
  });

  // Standard vaults
  const standardVaults: Vault[] = getVaultsByType('standard').map(v => ({
    id: v.id,
    address: v.earnContractAddress as Address,
    // This enables merkl ERC20 campaign support targeting standard vaults
    poolAddress: v.earnContractAddress as Address,
    chainId: v.network,
    type: 'standard',
  }));

  return uniqBy([...clmVaults, ...standardVaults], v => v.id);
});

const getChainsWithOffchainRewards = createFactory(() => {
  return Array.from(new Set(getVaultsWithOffchainRewards().map(vault => vault.chainId)));
});

const getService = createFactory(async () => {
  const vaults = getVaultsWithOffchainRewards();
  return await OffchainRewards.create(vaults, TIME_BETWEEN_UPDATES, CACHE_KEY);
});

export async function initOffchainRewardsService() {
  await Promise.all([serviceEventBus.waitForFirstEvent('vaults/updated')]);
  getService().catch(err => {
    logger.error({ err }, 'service initialization failed');
  });
}

export async function getCampaignsForChain(chainId: AnyChain): Promise<ReadonlyArray<Campaign>> {
  const appChain = toAppChain(chainId);
  const service = await getService();
  return service.getCampaignsForChain(appChain);
}

export async function getCampaignsForChainWithMeta(chainId: AnyChain): Promise<CampaignsWithMeta> {
  const appChain = toAppChain(chainId);
  const service = await getService();
  return service.getCampaignsForChain(appChain, true);
}

export async function getCampaignsForChainProvider(
  chainId: AnyChain,
  providerId: ProviderId
): Promise<ReadonlyArray<Campaign>> {
  const appChain = toAppChain(chainId);
  const service = await getService();
  return service.getCampaignsForChainProvider(appChain, providerId);
}

export async function getCampaignsForChainProviderWithMeta(
  chainId: AnyChain,
  providerId: ProviderId
): Promise<CampaignsWithMeta> {
  const appChain = toAppChain(chainId);
  const service = await getService();
  return service.getCampaignsForChainProvider(appChain, providerId, true);
}

export async function getAllCampaigns() {
  const chainIds = getChainsWithOffchainRewards();
  return (await Promise.all(chainIds.map(chainId => getCampaignsForChain(chainId)))).flat();
}

export async function getAllCampaignsWithMeta() {
  const chainIds = getChainsWithOffchainRewards();
  const perChain = await Promise.all(chainIds.map(chainId => getCampaignsForChainWithMeta(chainId)));
  return {
    lastUpdated: perChain.map(chain => chain.lastUpdated).reduce((a, b) => Math.max(a, b), 0),
    campaigns: perChain.flatMap(chain => chain.campaigns),
  };
}

function makeRequestHandler(options: { chain: boolean; active: boolean }) {
  const getMeta = options.chain
    ? (ctx: Context) => {
        const chainId = ctx.params.chainId;
        if (!chainId || !isApiChain(chainId)) {
          sendBadRequest(ctx, 'Invalid chain id');
          return;
        }

        return getCampaignsForChainWithMeta(chainId);
      }
    : getAllCampaignsWithMeta;
  const filterCampaigns = options.active
    ? (campaigns: ReadonlyArray<Campaign>) => campaigns.filter(campaign => campaign.active)
    : (campaigns: ReadonlyArray<Campaign>) => campaigns;
  const sortCampaigns = (campaigns: ReadonlyArray<Campaign>) => sortBy(campaigns, c => c.id);

  return async (ctx: Context) => {
    const meta = await getMeta(ctx);
    if (!meta) {
      return;
    }

    if (meta.lastUpdated === 0) {
      sendServiceUnavailable(ctx, 'Not available yet');
      return;
    }

    const campaigns = sortCampaigns(filterCampaigns(meta.campaigns));
    sendSuccess(ctx, campaigns, {
      maxAge: 5 * 60,
    });
  };
}

export const handleOffChainRewardsAll = makeRequestHandler({ chain: false, active: false });
export const handleOffChainRewardsAllForChain = makeRequestHandler({ chain: true, active: false });

export const handleOffChainRewardsActive = makeRequestHandler({ chain: false, active: true });
export const handleOffChainRewardsActiveForChain = makeRequestHandler({
  chain: true,
  active: true,
});
