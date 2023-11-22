import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import SiloTokenAbi from '../../../abis/arbitrum/SiloToken';
import SiloAbi from '../../../abis/arbitrum/Silo';

export const getSiloPrices = async (chainId, pools, tokenPrices) => {
  const [amountCalls, totalSupplyCalls] = pools.reduce(
    (acc, pool) => {
      const siloTokenContract = fetchContract(pool.address, SiloTokenAbi, chainId);
      const siloContract = fetchContract(pool.silo, SiloAbi, chainId);
      acc[0].push(siloContract.read.assetStorage([pool.underlying]));
      acc[1].push(siloTokenContract.read.totalSupply());
      return acc;
    },
    [[], []]
  );

  const [amountResults, totalSupplyResults] = await Promise.all([
    Promise.all(amountCalls),
    Promise.all(totalSupplyCalls),
  ]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const token = pool.underlying;
    const balance = new BigNumber(amountResults[i]['totalDeposits']).div(pool.decimals);
    const totalSupply = new BigNumber(totalSupplyResults[i]).div(pool.decimals);

    const priceUnderlying = getTokenPrice(tokenPrices, pool.oracleId);
    const price = balance.times(priceUnderlying).div(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: [token],
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
    console.error(`Silo Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getSiloPrices;
