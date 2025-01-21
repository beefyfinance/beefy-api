import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import VenusToken from '../../../abis/VenusToken';

export const getVenusPrices = async (chainId, pools, tokenPrices) => {
  const [totalSupplyCalls, exchangeRateCalls, underlyingCalls] = pools.reduce(
    (acc, pool) => {
      const vTokenContract = fetchContract(pool.cToken, VenusToken, chainId);
      acc[0].push(vTokenContract.read.totalSupply());
      acc[1].push(vTokenContract.read.exchangeRateStored());
      acc[2].push(vTokenContract.read.underlying());
      return acc;
    },
    [[], [], []]
  );

  const [totalSupplyResults, exchangeRateResults, underlyingResults] = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
    Promise.all(underlyingCalls),
  ]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const totalSupply = new BigNumber(totalSupplyResults[i]).div('1e8');
    const exchangeRate = new BigNumber(exchangeRateResults[i]).div('1e10').div(pool.decimals);

    const priceUnderlying = getTokenPrice(tokenPrices, pool.oracleId);
    const price = exchangeRate.times(priceUnderlying).toNumber();
    const balance = totalSupply.times(exchangeRate);

    prices[pool.name] = {
      price,
      tokens: [underlyingResults[i].toString()],
      balances: [balance.toString(10)],
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
    console.error(`Venus Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getVenusPrices;
