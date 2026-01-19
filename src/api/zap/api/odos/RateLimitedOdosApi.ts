import { OdosApi } from './OdosApi';
import PQueue from 'p-queue';
import { ApiResponse } from '../common';
import { ApiChain } from '../../../../utils/chain';

export class RateLimitedOdosApi extends OdosApi {
  constructor(baseUrl: string, apiKey: string, chain: ApiChain, protected readonly queue: PQueue) {
    super(baseUrl, apiKey, chain);
  }

  protected async post<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request: Record<string, unknown>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    return this.queue.add(() => super.post(path, request, extra));
  }

  protected async priorityPost<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request: Record<string, unknown>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    // Rate limit, but higher priority than normal post, as these are used for app api proxy
    return this.queue.add(() => super.priorityPost(path, request, extra), { priority: 2 });
  }
}
