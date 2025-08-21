import { ICacheBackend } from './ICacheBackend';
import { createClient, RedisClientType } from 'redis';

export class RedisCacheBackend implements ICacheBackend {
  private client: RedisClientType;
  private readonly timeoutMs = 30000; // 30 seconds

  protected constructor(url: string) {
    this.client = createClient({ url });

    this.client.on('connect', async () => {
      console.log('Connected to redis');
    });

    this.client.on('error', err => {
      console.error('Failed to connect to redis: ', err);
    });
  }

  private async withTimeout<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Redis ${operationName} operation timed out after ${this.timeoutMs}ms`)),
        this.timeoutMs
      )
    );

    try {
      return await Promise.race([operation(), timeout]);
    } catch (error) {
      console.error(`❌ [REDIS] ${operationName} failed:`, error.message);
    }
  }

  protected async connect() {
    await this.client.connect();
  }

  public static async create(url: string): Promise<RedisCacheBackend> {
    const instance = new RedisCacheBackend(url);
    await instance.connect();
    return instance;
  }

  async get(key: string): Promise<string> {
    return this.withTimeout(async () => {
      const result = await this.client.get(key);
      // can return empty object when there's a serialization issue
      if (
        result === null ||
        result === undefined ||
        (typeof result === 'object' && Object.keys(result).length === 0)
      ) {
        return undefined;
      }
      return String(result);
    }, `GET ${key}`);
  }

  async set(key: string, value: string): Promise<void> {
    await this.withTimeout(() => this.client.set(key, value), `SET ${key}`);
  }

  async delete(key: string): Promise<void> {
    await this.withTimeout(() => this.client.del(key), `DELETE ${key}`);
  }
}
