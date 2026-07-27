import { uniq } from 'lodash-es';
import { addressBookByChainId } from '../../packages/address-book/src/address-book/index.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'prices' });

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
      logger.debug(
        { chain: chainId, nativeOracleId, wrappedOracleId, nativePrice },
        'setting wrapped price to native price'
      );
      prices[wrappedOracleId] = nativePrice;
    } else if (nativePrice === undefined && wrappedPrice !== undefined) {
      logger.debug(
        { chain: chainId, nativeOracleId, wrappedOracleId, wrappedPrice },
        'setting native price to wrapped price'
      );
      prices[nativeOracleId] = wrappedPrice;
    } else if (nativePrice !== undefined && wrappedPrice !== undefined && nativePrice !== wrappedPrice) {
      logger.warn(
        { chain: chainId, nativeOracleId, nativePrice, wrappedOracleId, wrappedPrice },
        'native and wrapped prices differ'
      );
    }
  }

  return prices;
}

export function debugNativeWrappedPrices(tokenPrices: Record<string, number>, tag: string) {
  for (const [chainId, chainBook] of Object.entries(addressBookByChainId)) {
    const missingOracle = uniq([chainBook.native.oracleId, chainBook.tokens.WNATIVE.oracleId]).filter(
      oracleId => tokenPrices[oracleId] === undefined
    );
    if (missingOracle.length > 0) {
      logger.debug({ tag, chain: chainId, missingOracle }, 'missing native/wrapped prices');
    }
  }
}
