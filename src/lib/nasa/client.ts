const NASA_API_BASE = "https://api.nasa.gov";
const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

interface FetchOptions {
  cacheTime?: number;
  retries?: number;
}

interface NASAError {
  code: number;
  msg: string;
}

export class NASAClient {
  private apiKey: string;
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || NASA_API_KEY;
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  async fetch<T>(
    endpoint: string,
    params: Record<string, string> = {},
    options: FetchOptions = {}
  ): Promise<T> {
    const cacheKey = `${endpoint}?${new URLSearchParams(params)}`;
    const cached = this.getCache<T>(cacheKey);
    if (cached) return cached;

    const url = new URL(`${NASA_API_BASE}${endpoint}`);
    url.searchParams.set("api_key", this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: options.cacheTime || 3600 },
    });

    if (!response.ok) {
      const error: NASAError = await response.json();
      throw new Error(`NASA API Error: ${error.msg || response.statusText}`);
    }

    const data = await response.json();
    if (options.cacheTime) {
      this.setCache(cacheKey, data, options.cacheTime);
    }

    return data as T;
  }
}

export const nasaClient = new NASAClient();

export type { NASAError };