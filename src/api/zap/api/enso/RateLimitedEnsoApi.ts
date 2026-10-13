import type PQueue from 'p-queue';
import type { ApiResponse } from '../common.ts';
import { EnsoApi } from './EnsoApi.ts';

const MAX_PENDING_REQUESTS = 50;

export class RateLimitedEnsoApi extends EnsoApi {
  constructor(
    baseUrl: string,
    chainId: number,
    routers: readonly string[],
    zapRouter: string,
    apiKey: string,
    protected readonly queue: PQueue,
    protected readonly proxyQueue: PQueue
  ) {
    super(baseUrl, chainId, routers, zapRouter, apiKey);
  }

  protected async get<ResponseType extends object>(
    path: string,
    request: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.queue.add(() => super.get(path, request));
  }

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined,
  >(path: string, request: Record<string, string>, extra?: Extra): Promise<ApiResponse<ResponseType, Extra>> {
    // Shed load rather than queue unbounded public requests
    if (this.proxyQueue.size >= MAX_PENDING_REQUESTS) {
      return { code: 429, message: 'Enso proxy busy, try again later' };
    }
    // Own queue, so app requests never wait behind in-flight crawler requests
    return this.proxyQueue.add(() => super.priorityGet(path, request, extra));
  }
}
