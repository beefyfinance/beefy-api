import BigNumber from 'bignumber.js';
import { parseAbi } from 'viem';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

export const getTruePrices = async (chainId, pools, tokenPrices) => {
  const supplyCalls = pools.map(pool => fetchContract(pool.gauge, ERC20Abi, chainId).read.totalSupply());
  const [supplyRes] = await Promise.all([Promise.all(supplyCalls)]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const price = tokenPrices[pool.oracleId];
    const totalSupply = new BigNumber(supplyRes[i]).div(pool.decimals).toString(10);
    prices[pool.name] = {
      price,
      totalSupply,
      tokens: [],
      balances: [],
    };
  }
  return prices;
};
