import { KyberApi } from './KyberApi';
import PQueue from 'p-queue';
import { ApiResponse } from '../common';

export class RateLimitedKyberApi extends KyberApi {
  constructor(baseUrl: string, clientId: string, protected readonly queue: PQueue) {
    super(baseUrl, clientId);
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
