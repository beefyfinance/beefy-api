import { sleep } from '../../../../utils/time.ts';
import type { ApiResponse, ErrorApiResponse } from '../common.ts';
import { OkxApi } from './OkxApi.ts';
import type { OkxQueue } from './queue.ts';

const MAX_PENDING_PROXY_REQUESTS = 10;
const RATE_LIMIT_RETRY_DELAY_MS = 2000;

export class RateLimitedOkxApi extends OkxApi {
  constructor(
    baseUrl: string,
    chainId: number,
    routers: readonly string[],
    approveAddress: string,
    zapRouter: string,
    apiKey: string,
    apiSecret: string,
    apiPassphrase: string,
    protected readonly queue: OkxQueue
  ) {
    super(baseUrl, chainId, routers, approveAddress, zapRouter, apiKey, apiSecret, apiPassphrase);
  }

  protected async get<ResponseType extends object>(
    path: string,
    request: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    const fetch = () => this.queue.addCrawler(() => super.get<ResponseType>(path, request), this.breaker.signal);
    const response = await this.withBreaker(fetch);
    if (response.code !== 429) {
      return response;
    }
    // Retry once, so a stray 429 doesn't mark a token unsupported until the next crawl
    await sleep(RATE_LIMIT_RETRY_DELAY_MS);
    return this.withBreaker(fetch);
  }

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined,
  >(path: string, request: Record<string, string>, extra?: Extra): Promise<ApiResponse<ResponseType, Extra>> {
    // Shed load rather than queue unbounded public requests
    if (this.queue.pendingProxyCount >= MAX_PENDING_PROXY_REQUESTS) {
      return { code: 429, message: 'OKX proxy busy, try again later' };
    }
    return this.withBreaker(() =>
      this.queue.addProxy(() => super.priorityGet(path, request, extra), this.breaker.signal)
    );
  }

  /** Fails fast while the breaker is open, as a strict queue spends a slot even on calls that never fetch */
  protected async withBreaker<T>(enqueue: () => Promise<T>): Promise<T | ErrorApiResponse> {
    try {
      return await enqueue();
    } catch (err) {
      if (this.breaker.isOpen()) {
        return { code: 503, message: this.breaker.message };
      }
      throw err;
    }
  }
}
