import { ICacheBackend } from './ICacheBackend';

export class DummyCacheBackend implements ICacheBackend {
  async get(key: string): Promise<string> {
    return undefined;
  }

  async set(key: string, value: string): Promise<void> {
    return;
  }
}
