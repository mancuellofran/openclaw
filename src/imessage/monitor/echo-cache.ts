export function buildIMessageEchoScope(params: {
  accountId?: string | null;
  target: string;
}): string {
  return `${params.accountId ?? ""}:${params.target}`;
}

type CacheEntry = Map<string, number>;

export class SentMessageCache {
  private readonly ttlMs: number;
  private readonly textCache: CacheEntry = new Map();
  private readonly idCache: CacheEntry = new Map();

  constructor(opts: { ttlMs?: number } = {}) {
    this.ttlMs = opts.ttlMs ?? 5000;
  }

  rememberText(scope: string, text: string): void {
    const trimmed = text?.trim?.() ?? "";
    if (!trimmed) {
      return;
    }
    this.textCache.set(this.buildKey(scope, trimmed), Date.now());
    this.cleanup(this.textCache);
  }

  rememberId(scope: string, id: string | number): void {
    const normalized = String(id ?? "").trim();
    if (!normalized || normalized === "ok" || normalized === "unknown") {
      return;
    }
    this.idCache.set(this.buildKey(scope, normalized), Date.now());
    this.cleanup(this.idCache);
  }

  hasText(scope: string, text: string): boolean {
    const trimmed = text?.trim?.() ?? "";
    if (!trimmed) {
      return false;
    }
    return this.has(scope, trimmed, this.textCache);
  }

  hasId(scope: string, id: string | number): boolean {
    const normalized = String(id ?? "").trim();
    if (!normalized) {
      return false;
    }
    return this.has(scope, normalized, this.idCache);
  }

  private has(scope: string, value: string, cache: CacheEntry): boolean {
    const key = this.buildKey(scope, value);
    const timestamp = cache.get(key);
    if (!timestamp) {
      return false;
    }
    if (Date.now() - timestamp > this.ttlMs) {
      cache.delete(key);
      return false;
    }
    return true;
  }

  private buildKey(scope: string, value: string): string {
    return `${scope}:${value}`;
  }

  private cleanup(cache: CacheEntry): void {
    const now = Date.now();
    for (const [key, timestamp] of cache.entries()) {
      if (now - timestamp > this.ttlMs) {
        cache.delete(key);
      }
    }
  }
}
