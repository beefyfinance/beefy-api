import { ICacheBackend } from './ICacheBackend';
import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisModules,
  RedisScripts,
} from 'redis';

async function createRedisClient(
  url: string
): Promise<RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>> {
  return new Promise((resolve, reject) => {
    const client = createClient({ url });
    let resolved = false;

    client.once('connect', async () => {
      resolved = true;
      resolve(client);
    });

    client.once('error', err => {
      if (!resolved) {
        reject(err);
      }
    });

    client.connect().catch(err => reject(err));
  });
}

export class RedisCacheBackend implements ICacheBackend {
  protected constructor(
    protected client: RedisClientType<RedisDefaultModules & RedisModules, RedisScripts>
  ) {
    this.client.on('error', err => {
      console.error('Redis error: ', err);
    });
  }

  public static async create(url: string): Promise<RedisCacheBackend> {
    const client = await createRedisClient(url);
    return new RedisCacheBackend(client);
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }
}
