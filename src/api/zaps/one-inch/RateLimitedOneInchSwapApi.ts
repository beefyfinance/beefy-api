import { OneInchSwapApi } from './OneInchSwapApi';
import PQueue from 'p-queue';
import { ProxiedResponse } from './types.js';

export class RateLimitedOneInchSwapApi extends OneInchSwapApi {
  constructor(baseUrl: string, apiKey: string, protected readonly queue: PQueue) {
    super(baseUrl, apiKey);
  }

  protected async get<ResponseType extends {}, RequestType extends {}>(
    path: string,
    request?: RequestType
  ): Promise<ResponseType> {
    return this.queue.add(() => super.get(path, request));
  }

  protected async transparentGet<RequestType extends {}>(
    path: string,
    request: RequestType
  ): Promise<ProxiedResponse> {
    // Rate limit, but higher priority than normal get, as these are used for app api proxy
    return this.queue.add(() => super.transparentGet(path, request), { priority: 1 });
  }
}
