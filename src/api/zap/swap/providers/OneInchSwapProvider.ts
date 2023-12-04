import { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider';
import { getOneInchSwapApi, supportedSwapChains } from '../../api/one-inch';
import { fromWeiString, toWeiString } from '../../../../utils/big-number';
import { ApiChain } from '../../../../utils/chain';
import { isResultFulfilled } from '../../../../utils/promise';

export class OneInchSwapProvider implements ISwapProvider {
  public readonly id = 'one-inch';

  supportsChain(chain: ApiChain): boolean {
    return supportedSwapChains[chain] || false;
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0].from.chainId;
    const api = getOneInchSwapApi(chainId);
    const results = await Promise.allSettled(
      swaps.map(swap =>
        api.getQuote({
          src: swap.from.address,
          dst: swap.to.address,
          amount: toWeiString(swap.fromAmount, swap.from.decimals),
        })
      )
    );

    return results.map((result, index) => {
      if (!isResultFulfilled(result)) {
        return {
          from: swaps[index].from,
          fromAmount: swaps[index].fromAmount,
          to: swaps[index].to,
          error: result.reason?.message || 'Unknown request error',
        };
      }

      const quote = result.value;
      return {
        from: swaps[index].from,
        fromAmount: swaps[index].fromAmount,
        to: swaps[index].to,
        toAmount: fromWeiString(quote.toAmount, quote.toToken.decimals),
      };
    });
  }
}
