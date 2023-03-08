import { OneInchSwapApi } from './OneInchSwapApi';
import PQueue from 'p-queue';

export class RateLimitedOneInchSwapApi extends OneInchSwapApi {
  constructor(baseUrl: string, protected readonly queue: PQueue) {
    super(baseUrl);
  }

  protected async get<ResponseType extends {}, RequestType extends {}>(
    path: string,
    request?: RequestType
  ): Promise<ResponseType> {
    return this.queue.add(() => super.get(path, request));
  }
}
