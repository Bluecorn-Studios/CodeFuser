import { logger } from "./logger.js";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Lightweight in-memory fallback cache to avoid external calls when Redis is not configured
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

export const cache = {
  async get(key: string): Promise<string | null> {
    const now = Date.now();
    
    // 1. Check in-memory cache first
    const memVal = memoryCache.get(key);
    if (memVal) {
      if (memVal.expiresAt > now) {
        logger.info(`[CACHE] In-memory cache hit for key: ${key}`);
        return memVal.value;
      } else {
        memoryCache.delete(key);
      }
    }

    // 2. Query Upstash Redis if configured
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      try {
        const cleanUrl = UPSTASH_URL.endsWith('/') ? UPSTASH_URL : `${UPSTASH_URL}/`;
        const response = await fetch(`${cleanUrl}get/${key}`, {
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.result !== undefined) {
            logger.info(`[CACHE] Upstash Redis cache hit for key: ${key}`);
            if (data.result !== null) {
              // Cache in-memory for 10 seconds to avoid spamming Upstash
              memoryCache.set(key, { value: data.result, expiresAt: now + 10000 });
            }
            return data.result;
          }
        }
      } catch (err) {
        logger.error(`[CACHE] Upstash Redis GET error: ${err}`);
      }
    }

    return null;
  },

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    // 1. Save in-memory cache
    memoryCache.set(key, { value, expiresAt });

    // 2. Save to Upstash Redis if configured
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      try {
        const cleanUrl = UPSTASH_URL.endsWith('/') ? UPSTASH_URL : `${UPSTASH_URL}/`;
        // Upstash REST API uses SETEX endpoint: SETEX key ttl value
        const response = await fetch(`${cleanUrl}setex/${key}/${ttlSeconds}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`
          },
          body: value
        });
        if (response.ok) {
          logger.info(`[CACHE] Upstash Redis SET completed for key: ${key} (TTL: ${ttlSeconds}s)`);
        } else {
          logger.error(`[CACHE] Upstash Redis SET failed: ${response.statusText}`);
        }
      } catch (err) {
        logger.error(`[CACHE] Upstash Redis SET error: ${err}`);
      }
    }
  },

  async delete(key: string): Promise<void> {
    memoryCache.delete(key);

    if (UPSTASH_URL && UPSTASH_TOKEN) {
      try {
        const cleanUrl = UPSTASH_URL.endsWith('/') ? UPSTASH_URL : `${UPSTASH_URL}/`;
        await fetch(`${cleanUrl}del/${key}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`
          }
        });
      } catch (err) {
        logger.error(`[CACHE] Upstash Redis DEL error: ${err}`);
      }
    }
  }
};
