import { URLSearchParams } from 'url';
import {
  IKyberApi,
  isKyberErrorResponse,
  isKyberSuccessResponse,
  KyberResponse,
  QuoteData,
  QuoteRequest,
  QuoteResponse,
  SwapData,
  SwapRequest,
  SwapResponse,
} from './types';
import { mapValues, omitBy } from 'lodash';
import { redactSecrets } from '../../../../utils/secrets';
import { ApiResponse, isErrorApiResponse } from '../common';

export class KyberApi implements IKyberApi {
  constructor(protected readonly baseUrl: string, protected readonly clientId: string) {}

  protected buildUrl<T extends {}>(path: string, request?: T) {
    const params = request ? new URLSearchParams(request).toString() : '';
    return params ? `${this.baseUrl}${path}?${params}` : `${this.baseUrl}${path}`;
  }

  protected toStringDict(
    obj: Record<string, string | number | boolean | string[]>
  ): Record<string, string> {
    return mapValues(
      omitBy(obj, v => v === undefined),
      v => (Array.isArray(v) ? v.join(',') : String(v))
    );
  }

  protected buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return {
      Accept: 'application/json,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'BeefyApi',
      'x-client-id': this.clientId,
      ...additionalHeaders,
    };
  }

  protected withClientId(request?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...request,
      source: this.clientId,
    };
  }

  protected async doGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    // Send client id as `source` query param and `x-client-id` header
    const url = this.buildUrl(path, this.withClientId(request));
    const response = await fetch(url, {
      headers: this.buildHeaders(),
    });

    return this.handleResponse(response);
  }

  protected async doPost<ResponseType extends object>(
    path: string,
    request: Record<string, unknown>
  ): Promise<ApiResponse<ResponseType>> {
    // Send client id as `source` body param and `x-client-id` header
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(this.withClientId(request)),
    });

    return this.handleResponse(response);
  }

  protected async get<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doGet(path, request);
  }

  protected async post<ResponseType extends object>(
    path: string,
    request: Record<string, unknown>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doPost(path, request);
  }

  protected async priorityGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doGet(path, request);
  }

  protected async priorityPost<ResponseType extends object>(
    path: string,
    request: Record<string, unknown>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doPost(path, request);
  }

  protected async handleResponse<ResponseType extends object>(
    response: Response
  ): Promise<ApiResponse<ResponseType>> {
    if (response.headers.get('content-type')?.includes('application/json')) {
      const body = (await response.json()) as KyberResponse;

      if (response.status === 200 && isKyberSuccessResponse(body)) {
        return {
          code: 200,
          data: body.data as ResponseType,
        };
      }

      if (isKyberErrorResponse(body)) {
        return {
          code: response.status === 200 ? 500 : response.status,
          message: redactSecrets(body.message),
        };
      }
    }

    return {
      code: response.status === 200 ? 500 : response.status,
      message:
        response.status === 200 ? 'upstream response not json' : redactSecrets(response.statusText),
    };
  }

  async getQuote(request: QuoteRequest): Promise<QuoteData> {
    const response = await this.get<QuoteData>('/routes', this.toStringDict(request));

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async postSwap(request: SwapRequest): Promise<SwapData> {
    const response = await this.post<SwapData>('/route/build', request);

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching swap: ${response.message}`);
    }

    return response.data;
  }

  async getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteData>> {
    return await this.priorityGet<QuoteData>('/routes', this.toStringDict(request));
  }

  async postProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapData>> {
    return await this.priorityPost<SwapData>('/route/build', request);
  }
}
