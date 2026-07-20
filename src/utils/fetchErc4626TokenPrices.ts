import BigNumber from 'bignumber.js';
import { parseAbi } from 'viem';
import { addressBook, ChainId, Token } from '../../packages/address-book/src/address-book';
import { fetchContract } from '../api/rpc/client';
import { getLoggerFor } from './logger/index.js';

const logger = getLoggerFor({ module: 'prices', platform: 'erc4626' });

const abi = parseAbi(['function convertToAssets(uint256 shares) view returns (uint256)']);

const {
  ethereum: {
    tokens: { stcUSD, cUSD },
  },
} = addressBook;

// ERC-4626 vaults priced from their exchange rate: [underlying asset, share token]
// price(share) = assetsPerShare * price(underlying)
type Erc4626Vault = [underlying: Token, share: Token];

const tokens: Partial<Record<keyof typeof ChainId, Erc4626Vault[]>> = {
  ethereum: [[cUSD, stcUSD]],
};

const getErc4626Prices = async (
  tokenPrices: Record<string, number>,
  vaults: Erc4626Vault[],
  chainId: ChainId
): Promise<number[]> => {
  const assetCalls = vaults.map(([, share]) =>
    fetchContract(share.address, abi, chainId).read.convertToAssets([10n ** BigInt(share.decimals)])
  );

  let res;
  try {
    res = await Promise.all(assetCalls);
  } catch (e) {
    logger.warn({ err: e, chain: chainId }, 'erc4626 price fetch failed');
    // NaN is filtered out below, so a transient failure omits the price instead of propagating a bad value
    return vaults.map(() => NaN);
  }

  return vaults.map(([underlying, share], i) => {
    const underlyingPrice = tokenPrices[underlying.oracleId];
    if (!underlyingPrice) {
      logger.warn({ oracleId: underlying.oracleId, share: share.oracleId }, 'missing underlying price');
      return NaN;
    }
    const assetsPerShare = new BigNumber(res[i].toString()).shiftedBy(-underlying.decimals);
    return assetsPerShare.times(underlyingPrice).toNumber();
  });
};

const fetchErc4626TokenPrices = async (tokenPrices: Record<string, number>): Promise<Record<string, number>> => {
  // Prices and oracleIds both derive from the same entries so they can't fall out of alignment
  const entries = Object.entries(tokens) as [keyof typeof ChainId, Erc4626Vault[]][];
  const results = await Promise.all(
    entries.map(([chain, vaults]) => getErc4626Prices(tokenPrices, vaults, ChainId[chain]))
  );
  const vaults = entries.flatMap(([, chainVaults]) => chainVaults);
  return results.flat().reduce<Record<string, number>>((acc, price, i) => {
    // Skip unpriced vaults (NaN) so the oracleId stays absent rather than resolving to a bad value
    if (Number.isFinite(price)) acc[vaults[i][1].oracleId] = price;
    return acc;
  }, {});
};

export { fetchErc4626TokenPrices };
