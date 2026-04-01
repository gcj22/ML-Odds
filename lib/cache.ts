import { CacheEntry } from './types';

const memCache = new Map<string, CacheEntry<unknown>>();

async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const { Redis } = await import('@upstash/redis');
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (redis) {
    try {
      const val = await redis.get<T>(key);
      if (val !== null) return val;
    } catch {
      // fall through to memory cache
    }
  }

  const entry = memCache.get(key) as CacheEntry<T> | undefined;
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  if (entry) memCache.delete(key);
  return null;
}

export async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(key, data, { ex: ttlSeconds });
      return;
    } catch {
      // fall through to memory cache
    }
  }

  memCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function invalidateCache(key: string): Promise<void> {
  memCache.delete(key);
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch {
      // ignore
    }
  }
}

export function clearMemCache(): void {
  memCache.clear();
}
