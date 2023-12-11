import { getAmmTokenPrice, getAmmLpPrice, getAmmPrice } from '../api/stats/getAmmPrices';
import Token from '../../packages/address-book/types/token';
import { ChainId } from '../../packages/address-book/types/chainid';
import { addressBookByChainId } from '../../packages/address-book/address-book/index';
import { getAddress } from 'viem';

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
  { oracle, id },
  withUnknownLogging: boolean | string = true
): Promise<number> {
  if ((oracle === 'lps' || oracle === 'tokens' || oracle === 'any') && typeof id === 'string') {
    return fetchPriceTyped({ oracle, id }, withUnknownLogging);
  }
  if (oracle === 'hardcode' && typeof id === 'number') {
    return fetchPriceTyped({ oracle, id }, withUnknownLogging);
  }

  throw new Error(
    `Invalid oracle or id for fetchPrice, expected one of: lps, tokens, any, hardcode`
  );
}

/**
 * @dev Typed version of fetchPrice, we can't use this directly as we import json which isn't strongly typed
 */
export async function fetchPriceTyped(
  { oracle, id }: FetchPriceParams,
  withUnknownLogging: boolean | string = true
): Promise<number> {
  if (oracle === undefined) {
    console.trace('Undefined oracle for fetchPrice, expected one of: lps, tokens, any, hardcode');
    return 0;
  }

  if (id === undefined) {
    console.trace('Undefined oracle id for fetchPrice');
    return 0;
  }

  let price = 0;
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
      throw new Error(
        `Oracle '${oracle}' not implemented, expected one of: lps, tokens, any, hardcode`
      );
  }

  return price;
}

/**
 * Fetches the price of a given oracleId from either the lps or tokens oracle
 */
export async function fetchPriceFromOracleId(
  oracleId: string,
  withUnknownLogging: boolean | string = true
): Promise<number> {
  return fetchPriceTyped({ oracle: 'any', id: oracleId }, withUnknownLogging);
}

/**
 * Fetches the price of a given address book token
 */
export async function fetchPriceFromToken(
  token: Token,
  withUnknownLogging: boolean | string = true
): Promise<number> {
  return fetchPriceFromOracleId(token.oracleId, withUnknownLogging);
}

/**
 * Fetches the price of a given address book token id
 */
export async function fetchPriceFromTokenId(
  id: string,
  chainId: ChainId | keyof typeof ChainId,
  withUnknownLogging: boolean | string = true
): Promise<number> {
  const enumChainId: ChainId = typeof chainId === 'string' ? ChainId[chainId] : chainId;
  const token = addressBookByChainId[enumChainId].tokens[id];
  if (!token) {
    throw new Error(`Could not find token with id ${id} on chain ${chainId} in address book`);
  }
  return fetchPriceFromToken(token, withUnknownLogging);
}

/**
 * Fetches the price of a given address book token address
 */
export async function fetchPriceFromTokenAddress(
  address: string,
  chainId: ChainId | keyof typeof ChainId,
  withUnknownLogging: boolean | string = true
): Promise<number> {
  const enumChainId: ChainId = typeof chainId === 'string' ? ChainId[chainId] : chainId;
  const checksumAddress = getAddress(address);
  const token = addressBookByChainId[enumChainId].tokenAddressMap[checksumAddress];
  if (!token) {
    throw new Error(
      `Could not find token with address ${checksumAddress} on chain ${ChainId[enumChainId]} in address book`
    );
  }
  return fetchPriceFromToken(token, withUnknownLogging);
}
