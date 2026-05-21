const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

class RedisClient {
  private url: string | undefined;
  private token: string | undefined;
  private memoryCache: Map<string, { data: string; timestamp: number }> = new Map();

  constructor() {
    this.url = REDIS_URL;
    this.token = REDIS_TOKEN;
  }

  async get(key: string): Promise<string | null> {
    if (!this.url || !this.token) {
      const cached = this.memoryCache.get(key);
      return cached?.data || null;
    }

    try {
      const response = await fetch(`${this.url}/get/${key}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.result || null;
    } catch {
      const cached = this.memoryCache.get(key);
      return cached?.data || null;
    }
  }

  async set(key: string, value: string, ex?: number): Promise<void> {
    if (!this.url || !this.token) {
      this.memoryCache.set(key, { data: value, timestamp: Date.now() });
      return;
    }

    try {
      const url = ex 
        ? `${this.url}/set/${key}/${value}/EX/${ex}`
        : `${this.url}/set/${key}/${value}`;
      await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
    } catch {
      this.memoryCache.set(key, { data: value, timestamp: Date.now() });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.url || !this.token) {
      this.memoryCache.delete(key);
      return;
    }

    try {
      await fetch(`${this.url}/del/${key}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
    } catch {
      this.memoryCache.delete(key);
    }
  }
}

export const redis = new RedisClient();