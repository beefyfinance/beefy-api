import type { CacheSetOptions, ICacheBackend } from './ICacheBackend.ts';

export class DummyCacheBackend implements ICacheBackend {
  async get(key: string): Promise<string | undefined> {
    return undefined;
  }

  async set(key: string, value: string, options?: CacheSetOptions): Promise<void> {
    return;
  }

  async delete(key: string): Promise<void> {
    return;
  }
}
