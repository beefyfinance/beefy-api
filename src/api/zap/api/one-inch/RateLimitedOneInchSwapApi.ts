import { OneInchSwapApi } from './OneInchSwapApi';
import PQueue from 'p-queue';
import { ApiResponse } from '../common';

export class RateLimitedOneInchSwapApi extends OneInchSwapApi {
  constructor(baseUrl: string, apiKey: string, protected readonly queue: PQueue) {
    super(baseUrl, apiKey);
  }

  protected async get<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.queue.add(() => super.get(path, request));
  }

  protected async priorityGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    // Rate limit, but higher priority than normal get, as these are used for app api proxy
    return this.queue.add(() => super.priorityGet(path, request), { priority: 1 });
  }
}
