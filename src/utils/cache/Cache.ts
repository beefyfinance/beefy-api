import { ICacheBackend } from './ICacheBackend';

export type CacheOptions = {
  logWrites?: boolean;
};

export class Cache {
  constructor(protected backend: ICacheBackend, protected options: CacheOptions = {}) {}

  async get<T extends any>(key: string): Promise<T | undefined> {
    try {
      const value = await this.backend.get(key);
      return value === undefined ? undefined : (JSON.parse(value) as T);
    } catch {
      console.error(`Failed to get value for cache key ${key}`);
      return undefined;
    }
  }

  async set<T extends any>(key: string, value: T): Promise<void> {
    if (!key) {
      throw new Error('Cache key cannot be empty');
    }

    try {
      await this.backend.set(key, JSON.stringify(value));
      if (this.options.logWrites) {
        console.log(`> [${key}] saved to cache`);
      }
    } catch {
      console.error(`Failed to set value for cache key ${key}`);
    }
  }
}
