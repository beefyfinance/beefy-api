import { BigNumber } from 'bignumber.js';
import { isSwapResponseFailure, type ISwapProvider, type SwapRequest } from './providers/ISwapProvider.ts';
import type { ProviderId } from './providers/index.ts';
import type { ApiChain } from '../../../utils/chain.ts';
import type { BuyResult, BuyTestToken, TokenWithPrice } from './types.ts';
import { BIG_ONE } from '../../../utils/big-number.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'zap' });

const MOCK_ALL_SUPPORTED = process.env.ZAP_MOCK_SKIP_LIQUIDITY_CHECKS === 'true';
if (MOCK_ALL_SUPPORTED) {
  logger.warn('ZAP_MOCK_SKIP_LIQUIDITY_CHECKS is enabled, buy liquidity checks will be skipped');
}

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
        reason: `Buy output amount is less than expected [a=${actualOutput.toString(10)}, e=${expectedOutput.toString(
          10
        )}, m=${minOutput.toString(10)}, f=${result.fromAmount.toString(10)} n=${wnative.price.toString(
          10
        )}, t=${tokenWithPrice.price.toString(10)}]`,
      };
    });
  } catch (err) {
    logger.warn({ chain: apiChain, platform: providerKey, err }, 'error while checking buy with swap provider');
    const reason = err.message || 'Unknown swap provider error';
    return tokens.map(token => ({ supported: false, tokenWithPrice: token, reason }));
  }
}
