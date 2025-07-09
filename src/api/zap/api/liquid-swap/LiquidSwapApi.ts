import { URLSearchParams } from 'url';
import {
  ILiquidSwapApi,
  isLiquidSwapErrorResponse,
  isLiquidSwapSuccessResponse,
  LiquidSwapResponse,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './types';
import { mapValues, omitBy } from 'lodash';
import { redactSecrets } from '../../../../utils/secrets';
import { ApiResponse, isErrorApiResponse } from '../common';
import { ApiChain } from '../../../../utils/chain';
import { getZapProviderFee } from '../../fees';

export class LiquidSwapApi implements ILiquidSwapApi {
  readonly feeReceiver: string;
  readonly ZAP_FEE: number;

  constructor(protected readonly baseUrl: string, chain: ApiChain) {
    const feeData = getZapProviderFee('liquid-swap', chain);
    this.ZAP_FEE = feeData.value;
    if (!feeData.receiver) {
      throw new Error('No fee receiver found for LiquidSwap on ' + chain);
    }
    this.feeReceiver = feeData.receiver;
  }

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

  async getProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse>> {
    return await this.priorityGet<QuoteResponse>('/route', this.toStringDict(this.withFeeReceiver(request)));
  }

  async postProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>> {
    return this.getProxiedQuote(request);
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

  protected withFeeReceiver(
    request?: Record<string, string | number | boolean | string[]>
  ): Record<string, string | number | boolean | string[]> {
    return this.feeReceiver && (this.ZAP_FEE || 0) > 0
      ? {
          ...request,
          feeBps: (this.ZAP_FEE * 10000).toString(10), // *10000 to bps
          feeRecipient: this.feeReceiver,
        }
      : request;
  }

  protected async doGet<ResponseType extends object>(
    path: string,
    request?: Record<string, string>
  ): Promise<ApiResponse<ResponseType>> {
    const url = this.buildUrl(path, request);
    const response = await fetch(url, {
      headers: this.buildHeaders(),
    });

    return this.handleResponse(response);
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

  protected async handleResponse<ResponseType extends object>(
    response: Response
  ): Promise<ApiResponse<ResponseType>> {
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
