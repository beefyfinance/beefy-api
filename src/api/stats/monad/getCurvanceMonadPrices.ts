import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { CurvancePool } from './getCurvanceApys';
import CurvanceVault from '../../../abis/CurvanceVault';
import { MONAD_CHAIN_ID } from '../../../constants';

const pools: CurvancePool[] = require('../../../data/monad/curvancePools.json');

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
    console.error(`Silo Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};
