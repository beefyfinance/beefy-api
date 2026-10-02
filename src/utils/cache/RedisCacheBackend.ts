import { promisify } from 'node:util';
import { brotliCompress, brotliDecompress, constants as zlibConstants } from 'node:zlib';
import { createClient, RESP_TYPES, type RedisClientType } from 'redis';
import { getLoggerFor } from '../logger/index.ts';
import type { CacheSetOptions, ICacheBackend } from './ICacheBackend.ts';

const logger = getLoggerFor({ module: 'cache', component: 'redis' });

const brotliCompressAsync = promisify(brotliCompress);
const brotliDecompressAsync = promisify(brotliDecompress);
const BROTLI_QUALITY = 5;
/** cached values are JSON, which never starts with NUL */
const COMPRESSED_PREFIX = Buffer.from('\0br1');
const BUFFER_REPLIES = { [RESP_TYPES.BLOB_STRING]: Buffer };

export class RedisCacheBackend implements ICacheBackend {
  private client: RedisClientType;
  private readonly timeoutMs = 30000; // 30 seconds

  protected constructor(url: string) {
    this.client = createClient({ url });

    this.client.on('connect', async () => {
      logger.info('connected to redis');
    });

    this.client.on('error', err => {
      logger.warn({ err }, 'redis client error');
    });
  }

  private async withTimeout<T>(operation: () => Promise<T>, operationName: string): Promise<T | undefined> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Redis ${operationName} operation timed out after ${this.timeoutMs}ms`)),
        this.timeoutMs
      )
    );

    try {
      return await Promise.race([operation(), timeout]);
    } catch (error) {
      logger.warn({ operation: operationName, err: error }, 'redis operation failed');
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

  async get(key: string): Promise<string | undefined> {
    return this.withTimeout(async () => {
      const result = await this.client.withTypeMapping(BUFFER_REPLIES).get(key);
      // null when missing; can return empty object when there's a serialization issue
      if (!Buffer.isBuffer(result)) {
        return undefined;
      }
      if (result.subarray(0, COMPRESSED_PREFIX.length).equals(COMPRESSED_PREFIX)) {
        return (await brotliDecompressAsync(result.subarray(COMPRESSED_PREFIX.length))).toString('utf8');
      }
      return result.toString('utf8');
    }, `GET ${key}`);
  }

  async set(key: string, value: string, options?: CacheSetOptions): Promise<void> {
    const stored = options?.compress ? await this.compress(key, value) : value;
    await this.withTimeout(() => this.client.set(key, stored), `SET ${key}`);
  }

  async delete(key: string): Promise<void> {
    await this.withTimeout(() => this.client.del(key), `DELETE ${key}`);
  }

  private async compress(key: string, value: string): Promise<Buffer | string> {
    try {
      const input = Buffer.from(value, 'utf8');
      const compressed = await brotliCompressAsync(input, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: input.length,
        },
      });
      return Buffer.concat([COMPRESSED_PREFIX, compressed]);
    } catch (err) {
      logger.warn({ key, err }, 'redis compression failed, storing uncompressed');
      return value;
    }
  }
}
