import { TokenErc20 } from '../../../tokens/types';
import BigNumber from 'bignumber.js';
import { ApiChain } from '../../../../utils/chain';

export type SwapRequest = {
  from: TokenErc20;
  fromAmount: BigNumber;
  to: TokenErc20;
};

export type SwapResponseSuccess = {
  from: TokenErc20;
  fromAmount: BigNumber;
  to: TokenErc20;
  toAmount: BigNumber;
};

export type SwapResponseFailure = {
  from: TokenErc20;
  fromAmount: BigNumber;
  to: TokenErc20;
  error: string;
};

export type SwapResponse = SwapResponseSuccess | SwapResponseFailure;

export function isSwapResponseSuccess(quote: SwapResponse): quote is SwapResponseSuccess {
  return !('error' in quote);
}

export function isSwapResponseFailure(quote: SwapResponse): quote is SwapResponseFailure {
  return 'error' in quote;
}

export interface ISwapProvider {
  readonly id: string;
  supportsChain(chain: ApiChain): boolean;
  quotes(swaps: SwapRequest[]): Promise<SwapResponse[]>;
}
