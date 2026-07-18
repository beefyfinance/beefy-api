import type { ICacheBackend } from './ICacheBackend.ts';

export class DummyCacheBackend implements ICacheBackend {
  async get(key: string): Promise<string> {
    return undefined;
  }

  async set(key: string, value: string): Promise<void> {
    return;
  }

  async delete(key: string): Promise<void> {
    return;
  }
}
