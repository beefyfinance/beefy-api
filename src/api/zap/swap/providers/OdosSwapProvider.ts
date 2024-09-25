import { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider';
import { getOdosApi, supportedChains } from '../../api/odos';
import { fromWeiString, toWeiString } from '../../../../utils/big-number';
import { ApiChain } from '../../../../utils/chain';
import { isResultFulfilled } from '../../../../utils/promise';

export class OdosSwapProvider implements ISwapProvider {
  public readonly id = 'odos';

  supportsChain(chain: ApiChain): boolean {
    return !!supportedChains[chain];
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0].from.chainId;
    const api = getOdosApi(chainId);
    const results = await Promise.allSettled(
      swaps.map(swap =>
        api.postQuote({
          inputTokens: [
            {
              tokenAddress: swap.from.address,
              amount: toWeiString(swap.fromAmount, swap.from.decimals),
            },
          ],
          outputTokens: [
            {
              tokenAddress: swap.to.address,
              proportion: 1,
            },
          ],
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

      return {
        from: swaps[index].from,
        fromAmount: swaps[index].fromAmount,
        to: swaps[index].to,
        toAmount: fromWeiString(result.value.outAmounts[0], swaps[index].to.decimals),
      };
    });
  }
}
