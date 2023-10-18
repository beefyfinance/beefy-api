import { URLSearchParams } from 'url';
import {
  HealthCheckResponse,
  IOneInchSwapApi,
  ProxiedResponse,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './types';

export class OneInchSwapApi implements IOneInchSwapApi {
  constructor(protected readonly baseUrl: string, protected readonly apiKey: string) {}

  protected buildUrl<T extends {}>(path: string, request?: T) {
    let queryString: string | undefined;
    if (request) {
      const params = new URLSearchParams(request);
      queryString = params.toString();
    }

    return queryString ? `${this.baseUrl}${path}?${queryString}` : `${this.baseUrl}${path}`;
  }

  protected async get<ResponseType extends {}, RequestType extends {}>(
    path: string,
    request?: RequestType
  ): Promise<ResponseType> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (response.headers.get('content-type')?.includes('application/json')) {
      return await response.json();
    }

    throw new Error(`Unexpected response from ${url}: ${response.status} ${response.statusText}`);
  }

  protected async transparentGet<RequestType extends {}>(
    path: string,
    request: RequestType
  ): Promise<ProxiedResponse> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const proxyResponse: ProxiedResponse = {
      status: response.status,
      statusText: response.statusText,
    };

    if (response.headers.get('content-type')?.includes('application/json')) {
      proxyResponse.response = await response.json();
    }

    return proxyResponse;
  }

  protected addRequiredParams<T extends object>(request: T): T & { includeTokensInfo: boolean } {
    return {
      ...request,
      includeTokensInfo: true,
    };
  }

  async getProxiedQuote(request: QuoteRequest): Promise<ProxiedResponse> {
    return await this.transparentGet('/quote', this.addRequiredParams(request));
  }

  async getProxiedSwap(request: SwapRequest): Promise<ProxiedResponse> {
    return await this.transparentGet('/swap', this.addRequiredParams(request));
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get('/quote', this.addRequiredParams(request));
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.get('/swap', this.addRequiredParams(request));
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.get<HealthCheckResponse, undefined>('/healthcheck');
      return response.status === 'OK';
    } catch {
      return false;
    }
  }
}
