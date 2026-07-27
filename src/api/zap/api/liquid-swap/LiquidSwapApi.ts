import { URLSearchParams } from 'node:url';
import { mapValues, omitBy } from 'lodash-es';
import { redactSecrets } from '../../../../utils/secrets.ts';
import { type ApiResponse, type ExtraQuoteResponse, isErrorApiResponse, type SuccessApiResponse } from '../common.ts';
import {
  type ILiquidSwapApi,
  isLiquidSwapErrorResponse,
  isLiquidSwapSuccessResponse,
  type LiquidSwapResponse,
  type QuoteRequest,
  type QuoteResponse,
  type SwapRequest,
  type SwapResponse,
} from './types.ts';

export class LiquidSwapApi implements ILiquidSwapApi {
  constructor(protected readonly baseUrl: string) {}

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const response = await this.get<QuoteResponse>('/route', this.toStringDict(request));

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    return this.getQuote(request);
  }

  async getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse, ExtraQuoteResponse>> {
    return await this.priorityGet<QuoteResponse, ExtraQuoteResponse>('/route', this.toStringDict(request), {
      fee: {
        value: 0,
      },
    });
  }

  async postProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>> {
    // @dev liquid swap doesn't have separate quote/build endpoints
    return await this.priorityGet<SwapResponse>('/route', this.toStringDict(request));
  }

  protected buildUrl<T extends {}>(path: string, request?: T) {
    const params = request ? new URLSearchParams(request).toString() : '';
    return params ? `${this.baseUrl}${path}?${params}` : `${this.baseUrl}${path}`;
  }

  protected toStringDict(obj: Record<string, string | number | boolean | string[]>): Record<string, string> {
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
      ...additionalHeaders,
    };
  }

  protected async doGet<ResponseType extends object, Extra extends Record<string, unknown> | undefined = undefined>(
    path: string,
    request?: Record<string, string>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: this.buildHeaders(),
    });

    const apiResponse = await this.handleResponse(response);
    if (isErrorApiResponse(apiResponse)) {
      return apiResponse;
    }

    return {
      ...apiResponse,
      ...(extra === undefined ? {} : { extra }),
    } as SuccessApiResponse<ResponseType, Extra>;
  }

  protected async get<ResponseType extends object, Extra extends Record<string, unknown> | undefined = undefined>(
    path: string,
    request?: Record<string, string>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    return this.doGet(path, request, extra);
  }

  protected async priorityGet<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined,
  >(path: string, request?: Record<string, string>, extra?: Extra): Promise<ApiResponse<ResponseType, Extra>> {
    return this.doGet(path, request, extra);
  }

  protected async handleResponse<ResponseType extends object>(response: Response): Promise<ApiResponse<ResponseType>> {
    if (response.headers.get('content-type')?.includes('application/json')) {
      const body = (await response.json()) as LiquidSwapResponse;

      if (response.status === 200 && isLiquidSwapSuccessResponse(body)) {
        return {
          code: 200,
          data: body as ResponseType,
        };
      }

      if (isLiquidSwapErrorResponse(body)) {
        return {
          code: response.status === 200 ? 500 : response.status,
          message: redactSecrets(body.message),
        };
      }
    }

    return {
      code: response.status === 200 ? 500 : response.status,
      message: response.status === 200 ? 'upstream response not json' : redactSecrets(response.statusText),
    };
  }
}
