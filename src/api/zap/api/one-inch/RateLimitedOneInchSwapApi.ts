import { OneInchSwapApi } from './OneInchSwapApi.ts';
import type PQueue from 'p-queue';
import type { ApiResponse } from '../common.ts';

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

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(path: string, request?: Record<string, string>, extra?: Extra): Promise<ApiResponse<ResponseType, Extra>> {
    // Rate limit, but higher priority than normal get, as these are used for app api proxy
    return this.queue.add(() => super.priorityGet(path, request, extra), { priority: 1 });
  }
}
