import { IDivviApi, SubmitStatus } from './types';
import type { Hash } from 'viem';
import { postJson } from '../../../utils/http/index.js';
import { isFetchResponseError } from '../../../utils/http/errors.js';

export class DivviApi implements IDivviApi {
  constructor(private readonly baseUrl: string, private readonly apiKey: string) {}

  async submit(chainId: number, txHash: Hash): Promise<SubmitStatus> {
    try {
      await postJson({
        url: `${this.baseUrl}/submitReferral`,
        body: {
          txHash,
          chainId,
        },
        headers: {
          'X-Divvi-Api-Key': this.apiKey,
        },
      });
      return SubmitStatus.SUBMITTED;
    } catch (error) {
      console.error(`Failed to submit referral for transaction ${txHash} on chain ${chainId}:`, error);
      if (isFetchResponseError(error)) {
        const response = error.response;
        try {
          const body = await response.text();
          console.error('>', response.status, response.statusText, body);
        } catch {
          console.error('>', response.status, response.statusText);
        }
        if (response.status >= 400 && response.status < 500) {
          return SubmitStatus.CLIENT_ERROR;
        }
      }
      return SubmitStatus.SERVER_ERROR;
    }
  }
}
