import { OdosApi } from './OdosApi';
import PQueue from 'p-queue';
import { ApiResponse } from '../common';
import { ApiChain } from '../../../../utils/chain';

export class RateLimitedOdosApi extends OdosApi {
  constructor(baseUrl: string, apiKey: string, chain: ApiChain, protected readonly queue: PQueue) {
    super(baseUrl, apiKey, chain);
  }

  protected async post<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.queue.add(() => super.post(path, request));
  }

  protected async priorityPost<ResponseType extends object>(
    path: string,
    request?: Record<string, unknown>
  ): Promise<ApiResponse<ResponseType>> {
    // Rate limit, but higher priority than normal post, as these are used for app api proxy
    return this.queue.add(() => super.priorityPost(path, request), { priority: 2 });
  }
}
