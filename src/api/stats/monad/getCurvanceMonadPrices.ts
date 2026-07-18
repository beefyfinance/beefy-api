import { BigNumber } from 'bignumber.js';
import { fetchContract } from '../../rpc/client.ts';
import type { CurvancePool } from './getCurvanceApys.ts';
import CurvanceVault from '../../../abis/CurvanceVault.ts';
import { MONAD_CHAIN_ID } from '../../../constants.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import curvancePoolsData from '../../../data/monad/curvancePools.json' with { type: "json" };

const pools: CurvancePool[] = curvancePoolsData;
const logger = getLoggerFor({ module: 'prices', platform: 'curvance', chain: MONAD_CHAIN_ID });

export const getCurvanceMonadPrices = async tokenPrices => {
  const totalAssetsCalls = [];
  const totalSupplyCalls = [];

  for (const pool of pools) {
    const curvanceVaultContract = fetchContract(pool.address, CurvanceVault, MONAD_CHAIN_ID) as any;
    totalAssetsCalls.push(curvanceVaultContract.read.totalAssets());
    totalSupplyCalls.push(curvanceVaultContract.read.totalSupply());
  }

  const [totalAssetsResults, totalSupplyResults] = await Promise.all([
    Promise.all(totalAssetsCalls),
    Promise.all(totalSupplyCalls),
  ]);

  let prices = {};
  for (const pool of pools) {
    const token = pool.underlying;
    const totalAssets = new BigNumber(totalAssetsResults[pools.indexOf(pool)]).div(pool.decimals);
    const totalSupply = new BigNumber(totalSupplyResults[pools.indexOf(pool)]).div(pool.decimals);

    const priceUnderlying = getTokenPrice(tokenPrices, pool.oracleId);
    const price = totalAssets.div(totalSupply).times(priceUnderlying).toNumber();

    prices[pool.name] = {
      price,
      tokens: [token],
      balances: [totalAssets.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.debug({ token: tokenSymbol }, 'unknown token price');
  }
  return tokenPrice;
};
