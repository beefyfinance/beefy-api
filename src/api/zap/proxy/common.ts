import Koa from 'koa';
import { getTokenByAddress, getTokenNative } from '../../tokens/tokens';
import { AnyChain, ApiChain, toApiChain } from '../../../utils/chain';
import { getAmmPrice } from '../../stats/getAmmPrices';
import { fromWeiString } from '../../../utils/big-number';

const MIN_QUOTE_VALUE: Partial<Record<ApiChain, number>> = {};
const NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export function setNoCacheHeaders(ctx: Koa.Context) {
  ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  ctx.set('Pragma', 'no-cache');
  ctx.set('Expires', '0');
}

export async function isQuoteValueTooLow(
  inputAmount: string,
  inputAddress: string,
  chainId: AnyChain
) {
  const apiChainId = toApiChain(chainId);
  const minQuoteValue = MIN_QUOTE_VALUE[apiChainId];
  if (!minQuoteValue) {
    return undefined;
  }

  const srcToken =
    inputAddress.toLowerCase() === NATIVE_ADDRESS.toLowerCase()
      ? getTokenNative(apiChainId)
      : getTokenByAddress(inputAddress, apiChainId);
  if (!srcToken) {
    return {
      code: 400,
      message: `Unsupported token: ${inputAddress}`,
    };
  }

  const srcPrice = await getAmmPrice(
    srcToken.oracleId || srcToken.id,
    `via isQuoteValueTooLow for ${inputAddress}`
  );
  if (!srcPrice) {
    return {
      code: 400,
      message: `Unsupported token: ${srcToken.symbol}`,
    };
  }

  const srcValue = fromWeiString(inputAmount, srcToken.decimals).multipliedBy(srcPrice);
  if (srcValue.isNaN() || !srcValue.isFinite() || srcValue.lt(minQuoteValue)) {
    return {
      code: 400,
      message: `Zap swap value too low, ${minQuoteValue} USD minimum required`,
    };
  }

  return undefined;
}
