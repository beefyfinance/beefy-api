import { isSwapResponseFailure, type ISwapProvider, type SwapRequest } from './providers/ISwapProvider.ts';
import type { ProviderId } from './providers/index.ts';
import type { ApiChain } from '../../../utils/chain.ts';
import type { SellResult, SellTestToken, TokenWithPrice } from './types.ts';
import { BigNumber } from 'bignumber.js';
import { BIG_ONE } from '../../../utils/big-number.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'zap' });

const MOCK_ALL_SUPPORTED = process.env.ZAP_MOCK_SKIP_LIQUIDITY_CHECKS === 'true';
if (MOCK_ALL_SUPPORTED) {
  logger.warn('ZAP_MOCK_SKIP_LIQUIDITY_CHECKS is enabled - sell liquidity checks will be skipped');
}

export async function checkSell(
  provider: ISwapProvider,
  providerKey: ProviderId,
  apiChain: ApiChain,
  wnative: TokenWithPrice,
  tokens: SellTestToken[],
  sellValue: number,
  minOutputRatio: number
): Promise<SellResult[]> {
  const expectedOutput = new BigNumber(sellValue / wnative.price); // $1000 in native token
  const minOutput = expectedOutput.times(minOutputRatio).decimalPlaces(wnative.token.decimals, BigNumber.ROUND_FLOOR);

  const requests: SwapRequest[] = tokens.map(token => ({
    from: token.token,
    fromAmount: new BigNumber(sellValue / token.price),
    to: wnative.token,
  }));

  if (MOCK_ALL_SUPPORTED) {
    return requests.map((_, i) => {
      return {
        supported: true,
        tokenWithPrice: tokens[i],
        output: BIG_ONE,
      };
    });
  }

  try {
    const results = await provider.quotes(requests);
    return results.map((result, i) => {
      const tokenWithPrice = tokens[i];

      if (isSwapResponseFailure(result)) {
        return { supported: false, tokenWithPrice, reason: result.error };
      }

      const actualOutput = result.toAmount;
      if (actualOutput.gte(minOutput)) {
        return { supported: true, tokenWithPrice, output: actualOutput };
      }

      return {
        supported: false,
        tokenWithPrice,
        reason: `Sell output amount is less than expected [a=${actualOutput.toString(10)}, e=${expectedOutput.toString(
          10
        )}, m=${minOutput.toString(10)}, f=${result.fromAmount.toString(10)} n=${wnative.price.toString(
          10
        )}, t=${tokenWithPrice.price.toString(10)}]`,
      };
    });
  } catch (err) {
    logger.warn({ platform: providerKey, chain: apiChain, err }, 'error while checking sell with swap provider');
    const reason = err.message || 'Unknown swap provider error';
    return tokens.map(tokenWithPrice => ({ supported: false, tokenWithPrice, reason }));
  }
}
