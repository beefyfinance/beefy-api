import BigNumber from 'bignumber.js';
import { isSwapResponseFailure, ISwapProvider, SwapRequest } from './providers/ISwapProvider';
import { ProviderId } from './providers';
import { ApiChain } from '../../../utils/chain';
import { BuyResult, BuyTestToken, TokenWithPrice } from './types';

export async function checkBuy(
  provider: ISwapProvider,
  providerKey: ProviderId,
  apiChain: ApiChain,
  wnative: TokenWithPrice,
  tokens: BuyTestToken[],
  buyValue: number,
  minOutputRatio: number
): Promise<BuyResult[]> {
  const buyAmount = new BigNumber(buyValue / wnative.price); // $1000 in native token

  const requests: SwapRequest[] = tokens.map(token => ({
    from: wnative.token,
    fromAmount: buyAmount,
    to: token.token,
  }));

  try {
    const results = await provider.quotes(requests);
    return results.map((result, i) => {
      const tokenWithPrice = tokens[i];

      if (isSwapResponseFailure(result)) {
        return { supported: false, tokenWithPrice, reason: result.error };
      }

      const expectedOutput = new BigNumber(buyValue / tokenWithPrice.price);
      const minOutput = expectedOutput
        .times(minOutputRatio)
        .decimalPlaces(tokenWithPrice.token.decimals, BigNumber.ROUND_FLOOR);
      const actualOutput = result.toAmount;

      if (actualOutput.gte(minOutput)) {
        return { supported: true, tokenWithPrice, output: actualOutput };
      }

      return {
        supported: false,
        tokenWithPrice,
        reason: `Buy output amount is less than expected [a=${actualOutput.toString(
          10
        )}, e=${expectedOutput.toString(10)}, m=${minOutput.toString(
          10
        )}, f=${result.fromAmount.toString(10)} n=${wnative.price.toString(
          10
        )}, t=${tokenWithPrice.price.toString(10)}]`,
      };
    });
  } catch (err) {
    console.error(
      `> [Zap] Error while checking buy with swap provider ${providerKey} on chain ${apiChain}`,
      err
    );
    const reason = err.message || 'Unknown swap provider error';
    return tokens.map(token => ({ supported: false, tokenWithPrice: token, reason }));
  }
}
