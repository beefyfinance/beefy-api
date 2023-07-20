import BigNumber from 'bignumber.js';
import pools from '../../../data/ethereum/conicPools.json';
import { ETH_CHAIN_ID } from '../../../constants';
import IConicPool from '../../../abis/ethereum/IConicPool';
import { fetchContract } from '../../rpc/client';

export const getConicPrices = async () => {
  const priceResults = await Promise.all(
    pools.map(pool =>
      fetchContract(pool.address, IConicPool, ETH_CHAIN_ID)
        .read.usdExchangeRate()
        .then(res => new BigNumber(res.toString()))
    )
  );
  const prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    prices[pool.name] = new BigNumber(priceResults[i]).div('1e18').toNumber();
  }
  return prices;
};
