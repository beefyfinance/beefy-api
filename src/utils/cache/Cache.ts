import { getLoggerFor } from '../logger/index.ts';
import type { ICacheBackend } from './ICacheBackend.ts';

const logger = getLoggerFor({ module: 'cache' });

export type CacheOptions = {
  logWrites?: boolean;
};

export class Cache {
  constructor(
    protected backend: ICacheBackend,
    protected options: CacheOptions = {}
  ) {}

  async get<T extends any>(key: string): Promise<T | undefined> {
    try {
      const value = await this.backend.get(key);
      return value === undefined ? undefined : (JSON.parse(value) as T);
    } catch {
      logger.warn({ key }, 'failed to get cache value');
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
        logger.debug({ key }, 'saved to cache');
      }
    } catch {
      logger.warn({ key }, 'failed to set cache value');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.backend.delete(key);
    } catch {
      logger.warn({ key }, 'failed to delete cache value');
    }
  }
}
