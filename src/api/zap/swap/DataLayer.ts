import { getKey, setKey } from '../../../utils/cache';
import { ProviderId } from './providers';
import { ApiChain, ApiChains } from '../../../utils/chain';
import {
  ProviderSupportByChainByAddress,
  TokenSupportByAddress,
  TokenSupportByChainByProviderByAddress,
} from './types';
import { keysToObject } from '../../../utils/array';
import { blockedTokensByChain } from './blocked-tokens';

export type ChainProvider = { apiChain: ApiChain; providerId: ProviderId };

type Metadata = {
  version: number;
};

const VERSION = 1;

export class DataLayer {
  protected tokenSupport: TokenSupportByChainByProviderByAddress = keysToObject(
    ApiChains,
    () => ({})
  );
  protected providerSupport: ProviderSupportByChainByAddress = keysToObject(ApiChains, () => ({}));

  constructor(protected rootKey: string, protected maxAge: number, protected gcInterval: number) {}

  /**
   * Loads token support data from cache (and runs garbage collection if it exists)
   */
  async loadFromCache() {
    try {
      // If we change data structure we can invalidate the cache by incrementing the version
      const metadata = await getKey<Metadata>(`${this.rootKey}/metadata`);
      if (!metadata || metadata.version !== VERSION) {
        return;
      }

      // Load the data
      const data = await getKey<TokenSupportByChainByProviderByAddress | undefined>(
        `${this.rootKey}/data`
      );
      if (!data) {
        return;
      }

      this.tokenSupport = data;

      // Garbage collect old data
      this.gc();

      // Build the provider support object
      this.buildProviderSupport();
    } catch (e) {
      console.error(`> [Zap] Failed to load zap token support from cache`, e);
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
    console.log('> [Zap] Running garbage collection for zap token support...');

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
      console.log(`> [Zap] Deleted ${deleted} old zap token support entries`);
      await this.saveToCache();
    }
  }

  /**
   * Runs garbage collection now then every `gcInterval` ms
   * @protected
   */
  protected gc() {
    this.performGarbageCollection()
      .catch(e => console.error('> [Zap] Failed to run gc', e))
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
      console.error('> [Zap] Failed to save zap token support to cache', e);
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
