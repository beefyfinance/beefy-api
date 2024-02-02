import BigNumber from 'bignumber.js';
import pools from '../../../data/ethereum/conicPools.json';
import { ETH_CHAIN_ID } from '../../../constants';
import IConicPool from '../../../abis/ethereum/IConicPool';
import ERC20Abi from '../../../abis/ERC20Abi';
import { fetchContract } from '../../rpc/client';

export const getConicPrices = async () => {
  const usdRateCalls = pools.map(pool =>
    fetchContract(pool.address, IConicPool, ETH_CHAIN_ID)
      .read.usdExchangeRate()
      .then(res => new BigNumber(res.toString()))
  );
  const totalSupplyCalls = pools.map(pool =>
    fetchContract(pool.token, ERC20Abi, ETH_CHAIN_ID)
      .read.totalSupply()
      .then(res => new BigNumber(res.toString()))
  );
  const [priceResults, supplyRes] = await Promise.all([
    Promise.all(usdRateCalls),
    Promise.all(totalSupplyCalls),
  ]);

  const prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const price = priceResults[i].div('1e18').toNumber();
    const totalSupply = supplyRes[i].div(pool.decimals).toString(10);
    prices[pool.name] = { price, totalSupply, tokens: [], balances: [] };
  }
  return prices;
};
