import { ISwapProvider, SwapRequest, SwapResponse } from './ISwapProvider';
import { getLiquidSwapApi, supportedChains } from '../../api/liquid-swap';
import { ApiChain } from '../../../../utils/chain';
import { isResultFulfilled } from '../../../../utils/promise';
import BigNumber from 'bignumber.js';

export class LiquidSwapSwapProvider implements ISwapProvider {
  public readonly id = 'liquid-swap';

  supportsChain(chain: ApiChain): boolean {
    return supportedChains.has(chain);
  }

  async quotes(swaps: SwapRequest[]): Promise<SwapResponse[]> {
    if (swaps.length === 0) {
      return [];
    }

    const chainId = swaps[0].from.chainId;
    const api = getLiquidSwapApi(chainId);
    const results = await Promise.allSettled(
      swaps.map(swap =>
        api.getQuote({
          tokenIn: swap.from.address,
          tokenOut: swap.to.address,
          amountIn: swap.fromAmount.toString(10), // @dev in decimal, not converted to wei
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
        toAmount: new BigNumber(quote.amountOut), // @dev in decimal, no need to convert from wei
      };
    });
  }
}
