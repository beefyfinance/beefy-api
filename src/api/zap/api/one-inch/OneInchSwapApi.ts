import { URLSearchParams } from 'node:url';
import { mapValues, omitBy } from 'lodash-es';
import { redactSecrets } from '../../../../utils/secrets.ts';
import { type ApiResponse, type ExtraQuoteResponse, isErrorApiResponse } from '../common.ts';
import {
  type IOneInchSwapApi,
  isOneInchErrorResponse,
  isOneInchSuccessResponse,
  type OneInchResponse,
  type QuoteRequest,
  type QuoteResponse,
  type SwapRequest,
  type SwapResponse,
} from './types.ts';

export class OneInchSwapApi implements IOneInchSwapApi {
  constructor(
    protected readonly baseUrl: string,
    protected readonly apiKey: string
  ) {}

  async getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse, ExtraQuoteResponse>> {
    return await this.priorityGet('/quote', this.toStringDict(this.addRequiredParams(request)), {
      fee: {
        value: 0,
      },
    });
  }

  async getProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>> {
    return await this.priorityGet('/swap', this.toStringDict(this.addRequiredParams(request)));
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const response = await this.get<QuoteResponse>('/quote', this.toStringDict(this.addRequiredParams(request)));

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async getSwap(request: SwapRequest): Promise<SwapResponse> {
    const response = await this.get<SwapResponse>('/swap', this.toStringDict(this.addRequiredParams(request)));

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

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

  protected async doGet<ResponseType extends object, Extra extends Record<string, unknown> | undefined = undefined>(
    path: string,
    request?: Record<string, string>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (response.headers.get('content-type')?.includes('application/json')) {
      const body = (await response.json()) as OneInchResponse;
      if (isOneInchErrorResponse(body)) {
        return {
          code: body.statusCode,
          message: redactSecrets(body.error),
        };
      }

      if (isOneInchSuccessResponse(body)) {
        return {
          code: 200,
          data: body as ResponseType,
          ...(extra === undefined ? {} : { extra }),
        };
      }

      if (response.status === 200) {
        return {
          code: 500,
          message: 'unexpected json response',
        };
      }
    }

    return {
      code: response.status === 200 ? 500 : response.status,
      message: response.status === 200 ? 'upstream response not json' : redactSecrets(response.statusText),
    };
  }

  protected async get<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doGet(path, request);
  }

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined,
  >(path: string, request?: Record<string, string>, extra?: Extra): Promise<ApiResponse<ResponseType, Extra>> {
    return this.doGet(path, request, extra);
  }

  /** for both quote and swap, proxy and direct */
  protected addRequiredParams<T extends object>(request: T): T & { includeTokensInfo: boolean } {
    return {
      ...request,
      includeTokensInfo: true,
    };
  }
}
