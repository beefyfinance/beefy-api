import { LiquidSwapApi } from './LiquidSwapApi.js';
import PQueue from 'p-queue';
import { ApiResponse } from '../common';
import { ApiChain } from '../../../../utils/chain';

export class RateLimitedLiquidSwapApi extends LiquidSwapApi {
  constructor(baseUrl: string, protected readonly queue: PQueue, chain: ApiChain) {
    super(baseUrl, chain);
  }

  protected async get<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request?: Record<string, string>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    return this.queue.add(() => super.get(path, request, extra));
  }

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request?: Record<string, string>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    // Rate limit, but higher priority than normal get, as these are used for app api proxy
    return this.queue.add(() => super.priorityGet(path, request, extra), { priority: 1 });
  }
}
