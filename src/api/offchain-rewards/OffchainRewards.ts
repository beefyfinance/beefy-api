import {
  Campaign,
  CampaignByProvider,
  CampaignsWithMeta,
  IOffchainRewardProvider,
  ProviderId,
  UpdateRejected,
  UpdateRequest,
  UpdateResolved,
  UpdateResult,
  Vault,
} from './types';
import { StellaSwapProvider } from './providers/stellaswap/StellaSwapProvider';
import { MerklProvider } from './providers/merkl/MerklProvider';
import { AppChain } from '../../utils/chain';
import AsyncLock from 'async-lock';
import { typedKeys } from '../../utils/object';
import { getKey, setKey } from '../../utils/cache';
import { createCachedFactory } from '../../utils/factory';
import { getUnixNow } from '../../utils/date';
import { mapValues, partition } from 'lodash';
import { isDefined } from '../../utils/array';
import PQueue from 'p-queue';
import { isUpdateResolved } from './typeguards';

type ChainCampaigns<TProvider extends ProviderId = ProviderId> = {
  campaigns: ReadonlyArray<CampaignByProvider[TProvider]>;
  /** last time an update was attempted */
  lastRequested: number;
  /** last time the campaigns were updated */
  lastUpdated: number;
  /** last time the campaigns were (locally) checked if they are still active */
  lastChecked: number;
};

type ByProviderValue<TProvider extends ProviderId = ProviderId> = {
  readonly providerId: TProvider;
  readonly provider: IOffchainRewardProvider<CampaignByProvider[TProvider]>;
  readonly byChain: {
    [TChain in AppChain]?: ChainCampaigns<TProvider>;
  };
};

type ByProvider = {
  readonly [TProvider in ProviderId]: ByProviderValue<TProvider>;
};

type CachedByProvider = {
  [K in keyof ByProvider]: ByProvider[K]['byChain'];
};

const CACHE_TYPE = 'CacheByProvider' as const;
const CACHE_VERSION: number = 2; // increase if the shape of CacheByProvider changes
const NO_DATA: ChainCampaigns = {
  campaigns: [],
  lastRequested: 0,
  lastUpdated: 0,
  lastChecked: 0,
};

export class OffchainRewards {
  protected readonly byProvider: ByProvider = {
    stellaswap: {
      providerId: 'stellaswap',
      provider: new StellaSwapProvider(),
      byChain: {},
    },
    merkl: {
      providerId: 'merkl',
      provider: new MerklProvider(),
      byChain: {},
    },
  };
  protected readonly startTime = getUnixNow();
  protected readonly chainIdsToCheck: AppChain[];
  protected lastSaved: number;
  protected lock = new AsyncLock();

  protected constructor(
    protected readonly vaults: Vault[],
    protected readonly secondsBetweenUpdates: number,
    protected readonly cacheKey: string,
    cachedValues?: CachedByProvider
  ) {
    this.lastSaved = this.startTime;
    this.chainIdsToCheck = Array.from(new Set(vaults.map(vault => vault.chainId)));

    if (cachedValues) {
      for (const providerId of typedKeys(this.byProvider)) {
        // restore cache of providers that still exist
        const providerCache = cachedValues[providerId];
        if (providerCache) {
          for (const chainId of typedKeys(providerCache)) {
            if (this.byProvider[providerId].provider.supportsChain(chainId)) {
              this.byProvider[providerId].byChain[chainId] = providerCache[chainId];
            }
          }
        }
      }
    }

    setInterval(this.scheduledUpdate.bind(this), 60 * 1000);
  }

  static async create(
    vaults: Vault[],
    secondsBetweenUpdates: number,
    cacheKey: string
  ): Promise<OffchainRewards> {
    const maybeCache = await getKey<{ type: string; version: number; data: CachedByProvider } | undefined>(
      cacheKey
    );
    const cachedValues: CachedByProvider | undefined =
      typeof maybeCache === 'object' &&
      maybeCache !== null &&
      maybeCache.type === CACHE_TYPE &&
      maybeCache.version === CACHE_VERSION &&
      typeof maybeCache.data === 'object'
        ? maybeCache.data
        : undefined;

    const instance = new OffchainRewards(vaults, secondsBetweenUpdates, cacheKey, cachedValues);
    await instance.updateIfStale();
    return instance;
  }

  protected scheduledUpdate() {
    this.updateIfStale().catch(err => {
      console.error('> [Offchain Rewards] Failed to perform scheduled update', err);
    });
  }

  async updateIfStale() {
    const now = getUnixNow();
    const updatesRequired: UpdateRequest[] = this.chainIdsToCheck
      .flatMap(chainId =>
        typedKeys(this.byProvider).map(providerId => {
          const providerEntry = this.byProvider[providerId];
          if (!providerEntry.provider.supportsChain(chainId)) {
            return undefined;
          }
          const vaults = this.getVaultsForChainProvider(chainId, providerEntry.provider, this.vaults);
          if (vaults.length === 0) {
            return undefined;
          }

          const providerChain = providerEntry.byChain[chainId];

          if (
            !providerChain ||
            providerChain.lastRequested < this.startTime ||
            now - providerChain.lastRequested >= this.secondsBetweenUpdates
          ) {
            return { chainId, providerId, type: 'full' as const };
          }

          if (providerChain.lastChecked < this.startTime || now - providerChain.lastChecked >= 60) {
            return { chainId, providerId, type: 'check' as const };
          }

          return undefined;
        })
      )
      .filter(isDefined);

    if (updatesRequired.length === 0) {
      return;
    }

    this.performUpdates(updatesRequired).catch(err => {
      console.error('> [Offchain Rewards] Failed to perform updates', err);
    });
  }

  protected buildUpdateResultSummary(results: UpdateResult[]) {
    const summary = {
      shouldSave: false,
      errors: [] as Array<{ chainId: string; providerId: string; reason: Error }>,
      updated: [] as Array<{ providerId: string; chainIds: string[] }>,
    };

    const [resolved, rejected] = partition(results, isUpdateResolved);

    if (resolved.length > 0) {
      summary.shouldSave = true;

      const fullUpdates = resolved.filter(res => res.request.type === 'full');
      if (fullUpdates.length) {
        const grouped = fullUpdates.reduce<Record<string, string[]>>((acc, res) => {
          const key = res.request.providerId;
          acc[key] ??= [];
          acc[key].push(res.request.chainId);
          return acc;
        }, {});
        for (const [providerId, chainIds] of Object.entries(grouped)) {
          summary.updated.push({ providerId, chainIds });
        }
      }
    }

    if (rejected.length > 0) {
      for (const rej of rejected) {
        summary.errors.push({
          chainId: rej.request.chainId,
          providerId: rej.request.providerId,
          reason: rej.reason,
        });
      }
    }

    return summary;
  }

  protected async performUpdates(updates: UpdateRequest[]) {
    // Ensure full updates aren't requested multiple times while one is in queue
    await this.markFullRequestTimes(updates, getUnixNow());

    console.info(`> [Offchain Rewards] Queuing ${updates.length} updates...`);
    const queue = new PQueue({
      concurrency: 1,
      autoStart: true,
    });
    const results = await queue.addAll(updates.map(update => () => this.performUpdate(update)));
    const { shouldSave, errors, updated } = this.buildUpdateResultSummary(results);

    if (updated.length) {
      console.info(
        `> [Offchain Rewards] Updated campaigns for ${updated
          .map(({ providerId, chainIds }) => `${providerId} on ${chainIds.join(', ')}`)
          .join('; ')}`
      );
    }
    if (errors.length) {
      for (const { chainId, providerId, reason } of errors) {
        console.error(
          `> [Offchain Rewards] Failed to update campaigns for ${providerId} on ${chainId}:`,
          reason
        );
      }
    }

    if (shouldSave) {
      await this.saveToCache();
    }
  }

  protected async markFullRequestTimes(updates: UpdateRequest[], requestTime: number) {
    const chainsPerProvider = updates
      .filter(u => u.type === 'full')
      .reduce((acc, update) => {
        acc[update.providerId] ??= [];
        acc[update.providerId].push(update.chainId);
        return acc;
      }, {} as Record<ProviderId, AppChain[]>);

    for (const [providerId, chainIds] of Object.entries(chainsPerProvider)) {
      const providerEntry = this.byProvider[providerId];
      if (!providerEntry) {
        return;
      }
      await this.lock.acquire(providerId, async () => {
        const byChain: ByProviderValue['byChain'] = providerEntry.byChain;
        for (const chainId of chainIds) {
          byChain[chainId] = {
            ...(byChain[chainId] || NO_DATA),
            lastRequested: requestTime,
          };
        }
      });
    }
  }

  protected async performUpdate(request: UpdateRequest): Promise<UpdateResult> {
    const reject = (reason: Error): UpdateRejected => ({
      request,
      status: 'rejected' as const,
      reason,
    });
    const resolve = (): UpdateResolved => ({
      request,
      status: 'resolved' as const,
    });

    const { chainId, providerId, type } = request;
    const providerEntry = this.byProvider[providerId];
    if (!providerEntry) {
      return reject(new Error(`Unknown offchain rewards provider: ${providerId}`));
    }
    const provider: IOffchainRewardProvider = providerEntry.provider;
    const byChain: ByProviderValue['byChain'] = providerEntry.byChain;
    if (!provider.supportsChain(chainId)) {
      return reject(new Error(`Offchain rewards provider ${providerId} does not support chain ${chainId}`));
    }
    const vaults = this.getVaultsForChainProvider(chainId, provider, this.vaults);

    return await this.lock.acquire(providerId, async () => {
      const requestTime = getUnixNow();
      const chain = {
        ...(byChain[chainId] || NO_DATA),
      };

      try {
        switch (type) {
          case 'full': {
            chain.campaigns = vaults.length === 0 ? [] : await provider.getCampaigns(chainId, vaults);
            chain.lastUpdated = getUnixNow();
            chain.lastChecked = chain.lastUpdated;
            break;
          }
          case 'check': {
            chain.campaigns = chain.campaigns.map(campaign => ({
              ...campaign,
              active: provider.isActive(campaign, requestTime),
            }));
            chain.lastChecked = getUnixNow();
            break;
          }
        }

        byChain[chainId] = chain;

        return resolve();
      } catch (e) {
        return reject(e instanceof Error ? e : new Error(String(e) || 'Unknown error'));
      }
    });
  }

  getCampaignsForChain(chainId: AppChain, withMeta: true): CampaignsWithMeta;
  getCampaignsForChain(chainId: AppChain, withMeta?: false | undefined): ReadonlyArray<Campaign>;
  getCampaignsForChain(chainId: AppChain, withMeta?: boolean): CampaignsWithMeta | ReadonlyArray<Campaign> {
    const perProvider = typedKeys(this.byProvider).map(providerId =>
      this.getCampaignsForChainProvider(chainId, providerId, true)
    );
    const allCampaigns = perProvider.flatMap(provider => provider.campaigns);

    if (!withMeta) {
      return allCampaigns;
    }

    return {
      lastUpdated: perProvider.map(provider => provider.lastUpdated).reduce((a, b) => Math.max(a, b), 0),
      campaigns: allCampaigns,
    };
  }

  protected getVaultsForChainProvider = createCachedFactory(
    (chainId: AppChain, provider: IOffchainRewardProvider, vaults: Vault[]) => {
      return vaults.filter(vault => vault.chainId === chainId && provider.supportsVault(vault));
    },
    (chainId, provider) => `${chainId}:${provider.id}`
  );

  getCampaignsForChainProvider(
    chainId: AppChain,
    providerId: ProviderId,
    withMeta: true
  ): Readonly<ChainCampaigns>;
  getCampaignsForChainProvider(
    chainId: AppChain,
    providerId: ProviderId,
    withMeta?: false | undefined
  ): ReadonlyArray<Campaign>;
  getCampaignsForChainProvider(
    chainId: AppChain,
    providerId: ProviderId,
    withMeta?: boolean
  ): Readonly<ChainCampaigns> | ReadonlyArray<Campaign> {
    const providerEntry = this.byProvider[providerId];
    if (!providerEntry) {
      return withMeta ? NO_DATA : [];
    }

    const { provider, byChain } = providerEntry;
    if (!provider.supportsChain(chainId)) {
      return withMeta ? NO_DATA : [];
    }

    const chain = byChain[chainId];
    if (!chain) {
      return withMeta ? NO_DATA : [];
    }

    const vaults = this.getVaultsForChainProvider(chainId, provider, this.vaults);
    if (vaults.length === 0) {
      return withMeta ? NO_DATA : [];
    }

    return withMeta ? chain : chain.campaigns;
  }

  protected async saveToCache() {
    if (this.getLatestChange() <= this.lastSaved) {
      return;
    }
    const providerIds = Object.values(this.byProvider).map(provider => provider.providerId);
    await this.lock.acquire(providerIds, async () => {
      if (this.getLatestChange() > this.lastSaved) {
        await setKey(this.cacheKey, {
          type: CACHE_TYPE,
          version: CACHE_VERSION,
          data: this.getDataToCache(),
        });
        this.lastSaved = getUnixNow();
      }
    });
  }

  protected getLatestChange() {
    return Math.max(
      ...Object.values(this.byProvider).flatMap(provider =>
        Object.values<ByProviderValue['byChain'][AppChain]>(provider.byChain).flatMap(chain => [
          chain.lastUpdated,
          chain.lastRequested,
        ])
      )
    );
  }

  /** @dev must be called within lock */
  protected getDataToCache(): CachedByProvider {
    return mapValues(this.byProvider, provider => provider.byChain) as CachedByProvider;
  }
}
