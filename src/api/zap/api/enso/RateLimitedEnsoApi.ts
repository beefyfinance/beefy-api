import type PQueue from 'p-queue';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import type { ApiResponse } from '../common.ts';
import { EnsoApi } from './EnsoApi.ts';

const MAX_PENDING_REQUESTS = 50;
// Caps public quote credit burn across all chains, before a quota 429 opens the breaker for everyone;
// route calls are exempt so a swap that already won a quote still builds
const MAX_PROXY_QUOTES_PER_WINDOW = 1000;
const PROXY_BUDGET_WINDOW_MS = 60 * 60 * 1000;

const logger = getLoggerFor({ module: 'zap', component: 'enso' });
const proxyBudget = { windowStart: 0, calls: 0 };

function isProxyBudgetExhausted(): boolean {
  const now = Date.now();
  if (now - proxyBudget.windowStart >= PROXY_BUDGET_WINDOW_MS) {
    proxyBudget.windowStart = now;
    proxyBudget.calls = 0;
  }
  if (++proxyBudget.calls === MAX_PROXY_QUOTES_PER_WINDOW + 1) {
    logger.warn({ limit: MAX_PROXY_QUOTES_PER_WINDOW }, 'enso proxy quote budget exhausted');
  }
  return proxyBudget.calls > MAX_PROXY_QUOTES_PER_WINDOW;
}

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
    if (
      this.proxyQueue.size >= MAX_PENDING_REQUESTS
      || (path === '/shortcuts/quote' && !this.breaker.isOpen() && isProxyBudgetExhausted())
    ) {
      return { code: 429, message: 'Enso proxy busy, try again later' };
    }
    // Own queue, so app requests never wait behind in-flight crawler requests
    return this.proxyQueue.add(() => super.priorityGet(path, request, extra));
  }
}
