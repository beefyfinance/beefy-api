import { ICacheBackend } from './ICacheBackend';
import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisModules,
  RedisScripts,
} from 'redis';

export class RedisCacheBackend implements ICacheBackend {
  private client: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>;

  protected constructor(url: string) {
    this.client = createClient({ url });

    this.client.on('connect', async () => {
      console.log('Connected to redis');
    });

    this.client.on('error', err => {
      console.error('Failed to connect to redis: ', err);
    });
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
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
