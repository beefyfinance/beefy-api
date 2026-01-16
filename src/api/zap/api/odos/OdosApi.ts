import { URLSearchParams } from 'url';
import {
  IOdosApiV3,
  isOdosErrorResponse,
  QuoteRequestV3,
  QuoteResponseV3,
  SwapRequestV3,
  SwapResponseV3,
} from './types';
import { redactSecrets } from '../../../../utils/secrets';
import { ApiResponse, ExtraQuoteResponse, isErrorApiResponse, SuccessApiResponse } from '../common';
import { getZapProviderFee } from '../../fees';
import { ApiChain, toChainId } from '../../../../utils/chain';
import { Address } from 'viem';

export class OdosApi implements IOdosApiV3 {
  protected readonly chainId: number;
  protected readonly feeBps: number;
  protected readonly feeReceiver: Address;

  constructor(
    protected readonly baseUrl: string,
    protected readonly apiKey: string,
    protected readonly chain: ApiChain
  ) {
    this.chainId = toChainId(chain);
    if (this.chainId === undefined) {
      throw new Error(`Invalid chain ${chain}`);
    }

    const feeData = getZapProviderFee('odos', chain);
    this.feeBps = feeData.value;
    if (!feeData.receiver) {
      throw new Error('No fee receiver found for Odos on ' + chain);
    }
    this.feeReceiver = feeData.receiver;
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

  protected withPartnerFee(request?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...request,
      partnerFeePercent: this.feeBps,
      feeRecipient: this.feeReceiver,
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

  protected async doPost<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request: Record<string, unknown>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    const url = this.buildUrl(path);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders({
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      }),
      body: JSON.stringify(this.withChainId(request)),
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

  protected async post<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request: Record<string, unknown>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    return this.doPost(path, request, extra);
  }

  protected async priorityPost<
    ResponseType extends object,
    Extra extends Record<string, unknown> | undefined = undefined
  >(
    path: string,
    request: Record<string, unknown>,
    extra?: Extra
  ): Promise<ApiResponse<ResponseType, Extra>> {
    return this.doPost(path, request, extra);
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

  async postQuote(request: QuoteRequestV3): Promise<QuoteResponseV3> {
    const response = await this.post<QuoteResponseV3>('/sor/quote/v3', request);

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching quote: ${response.code} ${response.message}`);
    }

    return response.data;
  }

  async postProxiedQuote(request: QuoteRequestV3): Promise<ApiResponse<QuoteResponseV3, ExtraQuoteResponse>> {
    return await this.priorityPost<QuoteResponseV3, ExtraQuoteResponse>(
      '/sor/quote/v3',
      this.withPartnerFee(request),
      {
        fee: {
          value: this.feeBps,
        },
      }
    );
  }

  async postSwap(request: SwapRequestV3): Promise<SwapResponseV3> {
    const response = await this.post<SwapResponseV3>('/sor/assemble', request);

    if (isErrorApiResponse(response)) {
      throw new Error(`Error fetching swap: ${response.message}`);
    }

    return response.data;
  }

  async postProxiedSwap(request: SwapRequestV3): Promise<ApiResponse<SwapResponseV3>> {
    return await this.priorityPost<SwapResponseV3>('/sor/assemble', request);
  }
}
