import { URLSearchParams } from 'url';
import {
  IOdosApi,
  isOdosErrorResponse,
  QuoteRequest,
  QuoteResponse,
  SwapRequest,
  SwapResponse,
} from './types';
import { redactSecrets } from '../../../../utils/secrets';
import { ApiResponse, isErrorApiResponse } from '../common';
import { getZapProviderFee } from '../../fees';
import { ApiChain, toChainId } from '../../../../utils/chain';

export class OdosApi implements IOdosApi {
  readonly ZAP_FEE: number;
  readonly referralCode: number;
  readonly chainId: number;
  constructor(
    protected readonly baseUrl: string,
    protected readonly apiKey: string,
    protected readonly chain: ApiChain
  ) {
    this.referralCode = Number(process.env.ODOS_CODE || 0);
    this.ZAP_FEE = getZapProviderFee('odos', chain).value;
    this.chainId = toChainId(chain);
    if (this.chainId === undefined) {
      throw new Error(`Invalid chain ${chain}`);
    }
  }

  protected buildUrl<T extends {}>(path: string, request?: T) {
    const params = request ? new URLSearchParams(request).toString() : '';
    return params ? `${this.baseUrl}${path}?${params}` : `${this.baseUrl}${path}`;
  }

  protected withChainId(request?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...request,
      chainId: this.chainId,
    };
  }

  protected withReferralCode(request?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...request,
      referralCode: this.referralCode,
    };
  }

  protected buildHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return {
      Accept: 'application/json,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'BeefyApi',
      ...additionalHeaders,
    };
  }

  protected async doPost<ResponseType extends object>(
    path: string,
    request: Record<string, unknown>
  ): Promise<ApiResponse<ResponseType>> {
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      }),
      body: JSON.stringify(this.withChainId(request)),
    });

    return this.handleResponse(response);
  }

  protected async post<ResponseType extends object>(
    path: string,
    request: Record<string, unknown>
  ): Promise<ApiResponse<ResponseType>> {
    return this.doPost(path, request);
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
      const body = await response.json();

      if (response.status === 200) {
        return {
          code: 200,
          data: body as ResponseType,
        };
      }

      if (isOdosErrorResponse(body)) {
        return {
          code: response.status === 200 ? 500 : response.status,
          message: redactSecrets(body.detail),
        };
      }
    }

    return {
      code: response.status === 200 ? 500 : response.status,
      message: response.status === 200 ? 'upstream response not json' : redactSecrets(response.statusText),
    };
  }

  async postQuote(request: QuoteRequest): Promise<QuoteResponse> {
    const response = await this.post<QuoteResponse>('/sor/quote/v2', request);

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async postProxiedQuote(request: QuoteRequest): Promise<ApiResponse<QuoteResponse>> {
    return await this.priorityPost<QuoteResponse>('/sor/quote/v2', this.withReferralCode(request));
  }

  async postSwap(request: SwapRequest): Promise<SwapResponse> {
    const response = await this.post<SwapResponse>('/sor/assemble', request);

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching swap: ${response.message}`);
    }

    return response.data;
  }

  async postProxiedSwap(request: SwapRequest): Promise<ApiResponse<SwapResponse>> {
    return await this.priorityPost<SwapResponse>('/sor/assemble', request);
  }
}
