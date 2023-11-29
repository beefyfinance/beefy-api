import { Cache } from './Cache';
import { RedisCacheBackend } from './RedisCacheBackend';
import { DummyCacheBackend } from './DummyCacheBackend';
import { ICacheBackend } from './ICacheBackend';
import { FileCacheBackend } from './FileCacheBackend';

let cache: Cache | undefined;

export async function initCache() {
  if (cache) return;

  let backend: ICacheBackend;

  // Redis backend
  if (process.env.REDISCLOUD_URL && typeof process.env.REDISCLOUD_URL === 'string') {
    console.log('> Using Redis cache backend');
    backend = await RedisCacheBackend.create(process.env.REDISCLOUD_URL);
  }

  // File backend
  if (!backend && process.env.FILE_CACHE_BACKEND) {
    console.log('> Using file cache backend');
    backend = new FileCacheBackend();
  }

  // Fallback backend
  if (!backend) {
    console.log('> No cache backend specified, cache disabled');
    backend = new DummyCacheBackend();
  }

  cache = new Cache(backend);
}

export async function setKey<T extends any>(key: string, value: T): Promise<void> {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  await cache.set(key, value);
}

export async function getKey<T extends any>(key: string): Promise<T | undefined> {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  return cache.get<T>(key);
}

export async function deleteKey<T extends any>(key: string): Promise<void> {
  if (!cache) {
    throw new Error('Cache not initialized');
  }
  await cache.delete(key);
}
