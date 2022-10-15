import Redis from "ioredis";

const client = new Redis(process.env.REDIS_URL!);

const ttl = 1000 * 60 * 6; // 6 hours

export const redis = {
  async getItem(cacheKey: string) {
    return client.get(cacheKey);
  },

  async setItem(cacheKey: string, cacheValue: string) {
    // Use px or ex depending on whether you use milliseconds or seconds for your ttl
    await client.set(cacheKey, cacheValue, "PX", ttl);
  },
};
