import { ApiChain, isApiChain } from './chain';
import { getUnixTime } from 'date-fns';
import { getKey, setKey } from './cache';
import { pick } from 'lodash';

type MemoryStoreOptions = {
  /** how many seconds an entry is considered fresh for */
  fresh: number;
  /** after how many /additional/ seconds will the entry be evicted from the cache */
  stale: number;
  /** if your data format changes, increase this, so you don't retrieve data in the old format */
  version?: number;
};

export type CachedByChainOptions = MemoryStoreOptions & {
  /** redis cache key */
  key: string;
};

export type ChainMeta<T> = {
  value: T;
  updatedAt: number;
  freshUntil: number;
  staleUntil: number;
  version: number;
};

export type ByChainMeta<T> = {
  [K in ApiChain]?: ChainMeta<T> | undefined;
};

type SetFn<T> = (chainId: ApiChain, value: T) => void;
type GetFn<T> = (chainId: ApiChain) => ChainMeta<T> | undefined;
type DelFn = (chainId: ApiChain) => void;
type CallbackStore<T> = { set: SetFn<T>; get: GetFn<T>; del: DelFn };
type CallbackFn<T> = (store: CallbackStore<T>) => Promise<void>;

class MemoryStore<T> {
  protected byChain: ByChainMeta<T> = {};

  constructor(
    protected options: CachedByChainOptions,
    protected initialData: ByChainMeta<T> = {}
  ) {}

  public set(chainId: ApiChain, value: T) {
    const updatedAt = getUnixTime(new Date());
    const freshUntil = updatedAt + this.options.fresh;
    const staleUntil = freshUntil + this.options.stale;
    const data: ChainMeta<T> = {
      value,
      updatedAt,
      freshUntil,
      staleUntil,
      version: this.options.version,
    };

    this.byChain = {
      ...this.byChain,
      [chainId]: data,
    };
  }

  public get(chainId: ApiChain): ChainMeta<T> | undefined {
    const data = this.byChain[chainId];
    if (!data || data.version < this.options.version) {
      return undefined;
    }
    const now = getUnixTime(new Date());
    if (data.staleUntil < now) {
      return undefined;
    }

    return data;
  }

  public delete(chainId: ApiChain) {
    delete this.byChain[chainId];
  }

  public copy(): MemoryStore<T> {
    return new MemoryStore(this.options, this.toObject());
  }

  public keys(): ApiChain[] {
    return (Object.keys(this.byChain) as ApiChain[]).filter(chainId => !!this.get(chainId));
  }

  public toObject(): ByChainMeta<T> {
    return pick(this.byChain, this.keys());
  }
}

export class CachedByChain<T> {
  protected store: MemoryStore<T>;

  constructor(protected options: CachedByChainOptions) {
    this.options.version ??= 1;
    this.store = new MemoryStore(this.options);
  }

  public async load() {
    const cached = await getKey(this.options.key);
    if (!!cached && typeof cached === 'object' && !Array.isArray(cached)) {
      this.store = new MemoryStore(
        this.options,
        Object.entries(cached).reduce((byChain, [chainId, data]) => {
          if (!isApiChain(chainId)) {
            return byChain;
          }
          if (
            !data ||
            typeof data !== 'object' ||
            Array.isArray(data) ||
            !('value' in data) ||
            !('updatedAt' in data) ||
            !('freshUntil' in data) ||
            !('staleUntil' in data) ||
            !('version' in data)
          ) {
            return byChain;
          }
          if (data.version < this.options.version) {
            return byChain;
          }
          const now = getUnixTime(new Date());
          if (data.expiresAt < now) {
            return byChain;
          }

          byChain[chainId] = data as ChainMeta<T>;
          return byChain;
        }, {} as ByChainMeta<T>)
      );
    }
  }

  public async save() {
    await setKey(this.options.key, this.store.toObject());
  }

  public async set(chainId: ApiChain, value: T, save: boolean = true) {
    this.store.set(chainId, value);
    if (save) {
      await this.save();
    }
  }

  public get(chainId: ApiChain): ChainMeta<T> | undefined {
    return this.store.get(chainId);
  }

  public async delete(chainId: ApiChain, save: boolean = true) {
    this.store.delete(chainId);
    if (save) {
      await this.save();
    }
  }

  public async transaction(callback: CallbackFn<T>) {
    const txStore = this.store.copy();
    const set = (chainId: ApiChain, value: T) => txStore.set(chainId, value);
    const get = (chainId: ApiChain): ChainMeta<T> | undefined => txStore.get(chainId);
    const del = (chainId: ApiChain) => txStore.delete(chainId);

    try {
      await callback({ set, get, del });
      await setKey(this.options.key, txStore.toObject());
      this.store = txStore;
      return true;
    } catch (e: unknown) {
      console.log(`CachedByChain.transaction threw, not saving changes: ${e}`);
      return false;
    }
  }

  public keys(): ApiChain[] {
    return this.store.keys();
  }

  public toObject(): ByChainMeta<T> {
    return this.store.toObject();
  }
}
