import { addressBookByChainId } from '../../packages/address-book/src/address-book';
import { envBoolean } from './env';
import { uniq } from 'lodash';

const DEBUG_NORMALIZE_NATIVE_WRAPPED_PRICES = envBoolean('DEBUG_NORMALIZE_NATIVE_WRAPPED_PRICES', false);

/** Set wnative to native, or native to wnative, if one exists and the other doesn't. */
export function normalizeNativeWrappedPrices(prices: Record<string, number>): Record<string, number> {
  for (const [chainId, chainBook] of Object.entries(addressBookByChainId)) {
    const nativeOracleId = chainBook.native.oracleId;
    const wrappedOracleId = chainBook.tokens.WNATIVE.oracleId;

    if (nativeOracleId === wrappedOracleId) {
      continue;
    }

    const nativePrice = prices[nativeOracleId];
    const wrappedPrice = prices[wrappedOracleId];
    if (nativePrice !== undefined && wrappedPrice === undefined) {
      DEBUG_NORMALIZE_NATIVE_WRAPPED_PRICES &&
        console.debug(
          `[${chainId}] Setting wrapped ${wrappedOracleId} to equal native ${nativeOracleId} ${nativePrice}`
        );
      prices[wrappedOracleId] = nativePrice;
    } else if (nativePrice === undefined && wrappedPrice !== undefined) {
      DEBUG_NORMALIZE_NATIVE_WRAPPED_PRICES &&
        console.debug(
          `[${chainId}] Setting native ${nativeOracleId} to equal wrapped ${wrappedOracleId} ${wrappedPrice}`
        );
      prices[nativeOracleId] = wrappedPrice;
    } else if (nativePrice !== undefined && wrappedPrice !== undefined && nativePrice !== wrappedPrice) {
      DEBUG_NORMALIZE_NATIVE_WRAPPED_PRICES &&
        console.warn(
          `[${chainId}] Both native ${nativeOracleId} ${nativePrice} and wrapped ${wrappedOracleId} ${wrappedPrice} exist but are different prices`
        );
    }
  }

  return prices;
}

export function debugNativeWrappedPrices(tokenPrices: Record<string, number>, tag: string) {
  if (!DEBUG_NORMALIZE_NATIVE_WRAPPED_PRICES) {
    return;
  }

  for (const [chainId, chainBook] of Object.entries(addressBookByChainId)) {
    const missingOracle = uniq([chainBook.native.oracleId, chainBook.tokens.WNATIVE.oracleId]).filter(
      oracleId => tokenPrices[oracleId] === undefined
    );
    if (missingOracle.length > 0) {
      console.warn(`[${tag}] Missing ${missingOracle.join(', ')} for ${chainId}`);
    }
  }
}
