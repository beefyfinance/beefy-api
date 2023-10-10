import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import BunniLensAbi from '../../../abis/BunniLens';

export const getBunniPrices = async (chainId, pools, tokenPrices, lens) => {
  const [calls] = pools.reduce(
    (acc, pool) => {
      const contract = fetchContract(lens, BunniLensAbi, chainId);
      acc[0].push(contract.read.tokenBalances([pool.address]));
      return acc;
    },
    [[], []]
  );

  const [balanceCalls] = await Promise.all([Promise.all(calls)]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lp0 = pool.lp0;
    const lp1 = pool.lp1;
    const bal0 = new BigNumber(balanceCalls[i][0]).div(lp0.decimals);
    const bal1 = new BigNumber(balanceCalls[i][1]).div(lp1.decimals);
    const totalSupply = new BigNumber(balanceCalls[i][2]).div('1e18');

    const price0 = getTokenPrice(tokenPrices, lp0.oracleId);
    const price1 = getTokenPrice(tokenPrices, lp1.oracleId);
    const price = bal0.times(price0).plus(bal1.times(price1)).div(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: [lp0.address, lp1.address],
      balances: [bal0.toString(10), bal1.toString(10)],
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
    console.error(`Bunni Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getBunniPrices;
