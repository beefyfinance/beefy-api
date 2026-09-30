import { getAmmLpPrice, getAmmPrice, getAmmTokenPrice } from '../api/stats/getAmmPrices.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'prices' });

export type PriceOracle = 'lps' | 'tokens' | 'any';
export type HardcodeOracle = 'hardcode';
export type Oracle = PriceOracle | HardcodeOracle;

export type FetchPriceOracleParams = {
  oracle: PriceOracle;
  id: string;
};

export type FetchPriceHardcodeParams = {
  oracle: HardcodeOracle;
  id: number;
};

export type FetchPriceParams = FetchPriceOracleParams | FetchPriceHardcodeParams;

/**
 * Fetches the price of a given oracle id.
 * @dev This function no longer has a built-in cache as the underlying getAmmXPrice functions already have one.
 */
export async function fetchPrice(
  { oracle, id }: { oracle: unknown; id: unknown },
  withUnknownLogging: boolean | string = true
): Promise<number> {
  if ((oracle === 'lps' || oracle === 'tokens' || oracle === 'any') && typeof id === 'string') {
    return fetchPriceTyped({ oracle, id }, withUnknownLogging);
  }
  if (oracle === 'hardcode' && typeof id === 'number') {
    return fetchPriceTyped({ oracle, id }, withUnknownLogging);
  }

  throw new Error(`Invalid oracle or id for fetchPrice, expected one of: lps, tokens, any, hardcode`);
}

/**
 * @dev Typed version of fetchPrice, we can't use this directly as we import json which isn't strongly typed
 */
export async function fetchPriceTyped(
  { oracle, id }: FetchPriceParams,
  withUnknownLogging: boolean | string = true
): Promise<number> {
  if (oracle === undefined) {
    logger.warn('undefined oracle for fetchPrice');
    return 0;
  }

  if (id === undefined) {
    logger.warn('undefined oracle id for fetchPrice');
    return 0;
  }

  let price: number | undefined = 0;
  switch (oracle) {
    case 'any': {
      price = await getAmmPrice(id, withUnknownLogging);
      break;
    }
    case 'lps': {
      price = await getAmmLpPrice(id, withUnknownLogging);
      break;
    }
    case 'tokens': {
      price = await getAmmTokenPrice(id, withUnknownLogging);
      break;
    }
    case 'hardcode': {
      price = id;
      break;
    }
    default:
      throw new Error(`Oracle '${oracle}' not implemented, expected one of: lps, tokens, any, hardcode`);
  }

  return price ?? 0;
}
