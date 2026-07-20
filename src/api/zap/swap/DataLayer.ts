import { getKey, setKey } from '../../../utils/cache';
import { ProviderId } from './providers';
import { ApiChain, SupportedChains } from '../../../utils/chain';
import {
  ProviderSupportByChainByAddress,
  TokenSupportByAddress,
  TokenSupportByChainByProviderByAddress,
} from './types';
import { keysToObject } from '../../../utils/array';
import { blockedTokensByChain } from './blocked-tokens';
import { mapValues, pickBy } from 'lodash';
import { getLoggerFor } from '../../../utils/logger/index.js';

const logger = getLoggerFor({ module: 'zap' });

export type ChainProvider = { apiChain: ApiChain; providerId: ProviderId };

type Metadata = {
  version: number;
};

const VERSION = 1;

export class DataLayer {
  protected tokenSupport: TokenSupportByChainByProviderByAddress = keysToObject(SupportedChains, () => ({}));
  protected providerSupport: ProviderSupportByChainByAddress = keysToObject(SupportedChains, () => ({}));

  constructor(protected rootKey: string, protected maxAge: number, protected gcInterval: number) {}

  /**
   * Loads token support data from cache (and runs garbage collection if it exists)
   */
  async loadFromCache(chainProviders: ChainProvider[]) {
    try {
      // If we change data structure we can invalidate the cache by incrementing the version
      const metadata = await getKey<Metadata>(`${this.rootKey}/metadata`);
      if (!metadata || metadata.version !== VERSION) {
        return;
      }

      // Load the data
      let data = await getKey<TokenSupportByChainByProviderByAddress | undefined>(`${this.rootKey}/data`);
      if (!data) {
        return;
      }

      // Build a map of valid chain providers
      const chainProviderSupport: Map<ApiChain, Set<ProviderId>> = new Map();
      for (const { apiChain, providerId } of chainProviders) {
        let chain = chainProviderSupport.get(apiChain);
        if (!chain) {
          chain = new Set();
          chainProviderSupport.set(apiChain, chain);
        }
        chain.add(providerId);
      }

      // Filter out any unsupported chain providers from the loaded data
      this.tokenSupport = mapValues(data, (byProvider, chainId) => {
        const validChainProviders = chainProviderSupport.get(chainId as ApiChain);
        if (!validChainProviders) {
          return {};
        }

        return pickBy(byProvider, (_, providerId) => validChainProviders.has(providerId as ProviderId));
      });

      // Garbage collect old data
      this.gc();

      // Build the provider support object
      this.buildProviderSupport();
    } catch (e) {
      logger.warn({ err: e }, 'failed to load token support from cache');
    }
  }

  /**
   * Sets token support for a provider on a chain, then updates the provider support object and saves to cache
   */
  async set(apiChain: ApiChain, providerId: ProviderId, supportByAddress: TokenSupportByAddress) {
    if (!this.tokenSupport[apiChain]) {
      this.tokenSupport[apiChain] = {};
    }

    this.tokenSupport[apiChain][providerId] = supportByAddress;
    this.buildProviderSupportForChain(apiChain);

    await this.saveToCache();
  }

  get(apiChain: ApiChain, providerId: ProviderId): TokenSupportByAddress {
    return this.tokenSupport[apiChain]?.[providerId] || {};
  }

  getProviderSupport() {
    return this.providerSupport;
  }

  getTokenSupport() {
    return this.tokenSupport;
  }

  /**
   * Deletes data older than `maxAge` and saves to cache if changed
   * @protected
   */
  protected async performGarbageCollection() {
    logger.debug('running garbage collection for token support');

    let deleted = 0;
    const now = Date.now();

    // Delete old provider support
    for (const apiChain of Object.keys(this.tokenSupport)) {
      const blockedTokens = blockedTokensByChain[apiChain];

      for (const providerId of Object.keys(this.tokenSupport[apiChain])) {
        const supportByAddress = this.tokenSupport[apiChain][providerId];
        for (const address of Object.keys(supportByAddress)) {
          const support = supportByAddress[address];
          if (support.updatedAt + this.maxAge < now || blockedTokens.has(address)) {
            delete supportByAddress[address];
            ++deleted;
          }
        }
      }
    }

    if (deleted > 0) {
      logger.debug({ count: deleted }, 'deleted old token support entries');
      await this.saveToCache();
    }
  }

  /**
   * Runs garbage collection now then every `gcInterval` ms
   * @protected
   */
  protected gc() {
    this.performGarbageCollection()
      .catch(e => logger.warn({ err: e }, 'failed to run gc'))
      .finally(() => setTimeout(() => this.gc(), this.gcInterval));
  }

  /**
   * Saves token support data to cache
   * (provider support can be built from this)
   * @protected
   */
  protected async saveToCache() {
    try {
      await setKey(`${this.rootKey}/data`, this.tokenSupport);
      await setKey(`${this.rootKey}/metadata`, { version: VERSION });
    } catch (e) {
      logger.warn({ err: e }, 'failed to save token support to cache');
    }
  }

  protected buildProviderSupport() {
    for (const chain of Object.keys(this.tokenSupport)) {
      this.buildProviderSupportForChain(chain as ApiChain);
    }
  }

  protected buildProviderSupportForChain(chain: ApiChain) {
    const byProviderByAddressEntries = Object.entries(this.tokenSupport[chain]);
    if (byProviderByAddressEntries.length === 0) {
      this.providerSupport[chain] = {};
      return;
    }

    const now = Date.now();
    this.providerSupport[chain] = byProviderByAddressEntries.reduce(
      (acc: Record<string, Partial<Record<ProviderId, boolean>>>, [providerId, byAddress]) => {
        for (const [address, support] of Object.entries(byAddress)) {
          if (support.supported && support.updatedAt + this.maxAge > now) {
            if (!acc[address]) {
              acc[address] = {};
            }

            acc[address][providerId] = support.supported;
          }
        }
        return acc;
      },
      {}
    );
  }
}
