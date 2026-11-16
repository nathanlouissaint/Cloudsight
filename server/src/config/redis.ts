import { createClient, type RedisClientType } from "redis";
import { logger } from "./logger";

let client: RedisClientType | null = null;
let connectionAttempted = false;

function getClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => {
      logger.warn({ err: error }, "Redis cache unavailable");
    });
  }

  return client;
}

export async function connectRedis() {
  const redis = getClient();

  if (!redis || redis.isOpen || connectionAttempted) {
    return;
  }

  connectionAttempted = true;

  try {
    await redis.connect();
  } catch (error) {
    logger.warn({ err: error }, "Redis cache connection failed; continuing without cache");
  }
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const redis = getClient();

  if (!redis?.isOpen) {
    return null;
  }

  try {
    const value = await redis.get(key);

    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    logger.warn({ err: error }, "Redis cache read failed; continuing without cache");

    return null;
  }
}

export async function setCachedJson(
  key: string,
  value: unknown,
  ttlSeconds: number,
) {
  const redis = getClient();

  if (!redis?.isOpen) {
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    logger.warn({ err: error }, "Redis cache write failed; continuing without cache");
  }
}

export async function deleteCached(...keys: string[]) {
  const redis = getClient();

  if (!redis?.isOpen || keys.length === 0) {
    return;
  }

  try {
    await redis.del(keys);
  } catch (error) {
    logger.warn({ err: error }, "Redis cache invalidation failed; continuing without cache");
  }
}

export async function disconnectRedis() {
  if (client?.isOpen) {
    await client.quit();
  }
}

export async function isRedisHealthy() {
  const redis = getClient();

  if (!redis?.isOpen) {
    return false;
  }

  try {
    return (await redis.ping()) === "PONG";
  } catch (error) {
    logger.warn({ err: error }, "Redis health check failed");

    return false;
  }
}
