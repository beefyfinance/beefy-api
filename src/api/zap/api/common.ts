import { addressBook } from '@beefyfinance/blockchain-addressbook';
import type { Address } from 'viem';
import type { ApiChain } from '../../../utils/chain.ts';

export type SuccessApiResponse<T, E extends Record<string, unknown> | undefined = undefined> = {
  code: 200;
  data: T;
  extra?: E;
};

export type ErrorApiResponse = {
  code: number;
  message: string;
};

export type ApiResponse<T, E extends Record<string, unknown> | undefined = undefined> =
  | SuccessApiResponse<T, E>
  | ErrorApiResponse;

export function isSuccessApiResponse<T, E extends Record<string, unknown> | undefined = undefined>(
  obj: ApiResponse<T, E>
): obj is SuccessApiResponse<T, E> {
  return obj.code === 200;
}

export function isErrorApiResponse<T, E extends Record<string, unknown> | undefined = undefined>(
  obj: ApiResponse<T, E>
): obj is ErrorApiResponse {
  return obj.code !== 200;
}

export type ExtraQuoteResponse = {
  fee: { value: number } | { value: number; original: number };
};

/** BeefyZapRouter; the only allowed fromAddress/receiver for proxied swaps */
export function getZapRouter(apiChain: ApiChain): Address | undefined {
  return addressBook[apiChain].platforms.beefyfinance.zap as Address | undefined;
}
