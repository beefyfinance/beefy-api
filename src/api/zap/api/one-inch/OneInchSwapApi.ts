import { URLSearchParams } from 'url';
import {
  IOneInchSwapApi,
  isOneInchErrorResponse,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './types';
import { mapValues, omitBy } from 'lodash';
import { redactSecrets } from '../../../../utils/secrets';
import { isErrorApiResponse, ApiResponse } from '../common';

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

  protected toStringDict(obj: Record<string, string | number | boolean>): Record<string, string> {
    return mapValues(
      omitBy(obj, v => v === undefined),
      String
    );
  }

  protected async doGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (response.headers.get('content-type')?.includes('application/json')) {
      const body = await response.json();
      if (isOneInchErrorResponse(body)) {
        return {
          code: body.statusCode,
          message: redactSecrets(body.error),
        };
      }

      if (response.status === 200) {
        return {
          code: 200,
          data: body as ResponseType,
        };
      }
    }

    return {
      code: response.status === 200 ? 500 : response.status,
      message:
        response.status === 200 ? 'upstream response not json' : redactSecrets(response.statusText),
    };
  }

  protected async get<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doGet(path, request);
  }

  protected async priorityGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doGet(path, request);
  }

  protected addRequiredParams<T extends object>(request: T): T & { includeTokensInfo: boolean } {
    return {
      ...request,
      includeTokensInfo: true,
    };
  }

  async getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse>> {
    return await this.priorityGet('/quote', this.toStringDict(this.addRequiredParams(request)));
  }

  async getProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>> {
    return await this.priorityGet('/swap', this.toStringDict(this.addRequiredParams(request)));
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const response = await this.get<QuoteResponse>(
      '/quote',
      this.toStringDict(this.addRequiredParams(request))
    );

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    const response = await this.get<SwapResponse>(
      '/swap',
      this.toStringDict(this.addRequiredParams(request))
    );

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }
}
