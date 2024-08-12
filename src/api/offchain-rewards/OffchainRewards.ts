import {
  Campaign,
  CampaignByProvider,
  CampaignsWithMeta,
  IOffchainRewardProvider,
  ProviderId,
  Vault,
} from './types';
import { StellaSwapProvider } from './providers/stellaswap/StellaSwapProvider';
import { MerklProvider } from './providers/merkl/MerklProvider';
import { AppChain } from '../../utils/chain';
import { AsyncLock } from '../../utils/promise';
import { typedKeys } from '../../utils/object';
import { getKey, setKey } from '../../utils/cache';
import { createCachedFactory } from '../../utils/factory';
import { getUnixNow } from '../../utils/date';
import { mapValues } from 'lodash';

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
  readonly lock: AsyncLock;
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
      lock: new AsyncLock(),
      providerId: 'stellaswap',
      provider: new StellaSwapProvider(),
      byChain: {},
    },
    merkl: {
      lock: new AsyncLock(),
      providerId: 'merkl',
      provider: new MerklProvider(),
      byChain: {},
    },
  };
  protected readonly startTime = getUnixNow();
  protected lastSaved: number;

  protected constructor(
    protected readonly vaults: Vault[],
    protected readonly secondsBetweenUpdates: number,
    protected readonly cacheKey: string,
    cachedValues?: CachedByProvider
  ) {
    this.lastSaved = this.startTime;

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

    setInterval(this.saveToCache, 60 * 1000);
  }

  static async create(
    vaults: Vault[],
    secondsBetweenUpdates: number,
    cacheKey: string
  ): Promise<OffchainRewards> {
    const maybeCache = await getKey<
      { type: string; version: number; data: CachedByProvider } | undefined
    >(cacheKey);
    const cachedValues: CachedByProvider | undefined =
      typeof maybeCache === 'object' &&
      maybeCache !== null &&
      maybeCache.type === CACHE_TYPE &&
      maybeCache.version === CACHE_VERSION
        ? maybeCache.data
        : undefined;

    return new OffchainRewards(vaults, secondsBetweenUpdates, cacheKey, cachedValues);
  }

  async getCampaignsForChain(chainId: AppChain, withMeta: true): Promise<CampaignsWithMeta>;
  async getCampaignsForChain(
    chainId: AppChain,
    withMeta?: false | undefined
  ): Promise<ReadonlyArray<Campaign>>;
  async getCampaignsForChain(
    chainId: AppChain,
    withMeta?: boolean
  ): Promise<CampaignsWithMeta | ReadonlyArray<Campaign>> {
    if (!withMeta) {
      return (
        await Promise.all(
          typedKeys(this.byProvider).map(providerId =>
            this.getCampaignsForChainProvider(chainId, providerId, false)
          )
        )
      ).flat();
    }

    const perProvider = await Promise.all(
      typedKeys(this.byProvider).map(providerId =>
        this.getCampaignsForChainProvider(chainId, providerId, true)
      )
    );

    return {
      lastUpdated: perProvider
        .map(provider => provider.lastUpdated)
        .reduce((a, b) => Math.max(a, b), 0),
      campaigns: perProvider.flatMap(provider => provider.campaigns),
    };
  }

  protected getVaultsForChainProvider = createCachedFactory(
    (chainId: AppChain, provider: IOffchainRewardProvider, vaults: Vault[]) => {
      return vaults.filter(vault => vault.chainId === chainId && provider.supportsVault(vault));
    },
    (chainId, provider) => `${chainId}:${provider.id}`
  );

  async getCampaignsForChainProvider(
    chainId: AppChain,
    providerId: ProviderId,
    withMeta: true
  ): Promise<Readonly<ChainCampaigns>>;
  async getCampaignsForChainProvider(
    chainId: AppChain,
    providerId: ProviderId,
    withMeta?: false | undefined
  ): Promise<ReadonlyArray<Campaign>>;
  async getCampaignsForChainProvider(
    chainId: AppChain,
    providerId: ProviderId,
    withMeta?: boolean
  ): Promise<Readonly<ChainCampaigns> | ReadonlyArray<Campaign>> {
    const providerEntry = this.byProvider[providerId];
    if (!providerEntry) {
      return withMeta ? NO_DATA : [];
    }

    const { provider, lock, byChain } = providerEntry;
    if (!provider.supportsChain(chainId)) {
      return withMeta ? NO_DATA : [];
    }
    const vaults = this.getVaultsForChainProvider(chainId, provider, this.vaults);
    if (vaults.length === 0) {
      return withMeta ? NO_DATA : [];
    }

    return lock.acquire(async () => {
      const requestTime = getUnixNow();

      let chain = byChain[chainId];
      if (
        !chain ||
        chain.lastRequested < this.startTime ||
        requestTime - chain.lastRequested >= this.secondsBetweenUpdates
      ) {
        if (!chain) {
          byChain[chainId] = chain = {
            campaigns: [],
            lastRequested: requestTime,
            lastUpdated: 0,
            lastChecked: 0,
          };
        } else {
          chain.lastRequested = requestTime;
        }

        try {
          chain.campaigns = await provider.getCampaigns(chainId, vaults);
          chain.lastUpdated = getUnixNow();
          chain.lastChecked = chain.lastUpdated;
        } catch (e) {
          console.error(
            `> [Offchain Rewards] Failed to fetch campaigns for ${providerId} on ${chainId}`,
            e
          );
          return withMeta ? chain : chain.campaigns;
        }
      }

      if (requestTime - chain.lastChecked >= 60) {
        chain.campaigns = chain.campaigns.map(campaign => ({
          ...campaign,
          active: provider.isActive(campaign, requestTime),
        }));
      }

      return withMeta ? chain : chain.campaigns;
    });
  }

  protected saveToCache = async () => {
    if (this.getLatestChange() <= this.lastSaved) {
      return;
    }
    const locks = Object.values(this.byProvider).map(provider => provider.lock);
    await AsyncLock.acquireAll(locks, async () => {
      if (this.getLatestChange() > this.lastSaved) {
        await setKey(this.cacheKey, {
          type: CACHE_TYPE,
          version: CACHE_VERSION,
          data: this.getDataToCache(),
        });
        this.lastSaved = getUnixNow();
      }
    });
  };

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
