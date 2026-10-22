import { type ApiResponse, type ExtraQuoteResponse, isErrorApiResponse } from './common.ts';

/** Shares identical in-flight proxied quotes and caches successful ones, so repeats cost no upstream calls */
export class QuoteCache<R extends ApiResponse<unknown, ExtraQuoteResponse>> {
  protected readonly entries = new Map<string, { expiresAt: number; response: Promise<R> }>();

  constructor(protected readonly ttlMs: number) {}

  async get(key: string, fetchQuote: () => Promise<R>): Promise<R> {
    const now = Date.now();
    const existing = this.entries.get(key);
    if (existing && existing.expiresAt > now) {
      return existing.response;
    }

    this.prune(now);
    const response = fetchQuote();
    const entry = { expiresAt: Infinity, response };
    this.entries.set(key, entry);
    try {
      const result = await response;
      if (isErrorApiResponse(result)) {
        this.delete(key, entry);
      } else {
        entry.expiresAt = Date.now() + this.ttlMs;
      }
      return result;
    } catch (err) {
      this.delete(key, entry);
      throw err;
    }
  }

  protected delete(key: string, entry: unknown) {
    if (this.entries.get(key) === entry) {
      this.entries.delete(key);
    }
  }

  protected prune(now: number) {
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
  }
}
