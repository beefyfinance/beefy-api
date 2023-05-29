import fetch from 'node-fetch';
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
  constructor(protected readonly baseUrl: string) {}

  protected buildUrl<T extends {}>(path: string, request?: T) {
    const params = request ? new URLSearchParams(request).toString() : '';
    return params ? `${this.baseUrl}${path}?${params}` : `${this.baseUrl}${path}`;
  }

  protected async get<ResponseType extends {}, RequestType extends {}>(
    path: string,
    request?: RequestType
  ): Promise<ResponseType> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
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

  async getProxiedQuote(request: QuoteRequest): Promise<ProxiedResponse> {
    return await this.transparentGet('/quote', request);
  }

  async getProxiedSwap(request: SwapRequest): Promise<ProxiedResponse> {
    return await this.transparentGet('/swap', request);
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    return await this.get('/quote', request);
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.get('/swap', request);
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
