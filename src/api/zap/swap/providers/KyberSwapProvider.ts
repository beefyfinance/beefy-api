import { fromWeiString, toWeiString } from '../../../../utils/big-number.ts';
import type { ApiChain } from '../../../../utils/chain.ts';
import { isResultFulfilled } from '../../../../utils/promise.ts';
import { getKyberApi, supportedChains } from '../../api/kyber/index.ts';
import type { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider.ts';

export class KyberSwapProvider implements ISwapProvider {
  public readonly id = 'kyber';

  supportsChain(chain: ApiChain): boolean {
    return !!supportedChains[chain];
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0].from.chainId;
    const api = getKyberApi(chainId);
    const results = await Promise.allSettled(
      swaps.map(swap =>
        api.getQuote({
          tokenIn: swap.from.address,
          tokenOut: swap.to.address,
          amountIn: toWeiString(swap.fromAmount, swap.from.decimals),
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

      const quote = result.value.routeSummary;
      return {
        from: swaps[index].from,
        fromAmount: swaps[index].fromAmount,
        to: swaps[index].to,
        toAmount: fromWeiString(quote.amountOut, swaps[index].to.decimals),
      };
    });
  }
}
