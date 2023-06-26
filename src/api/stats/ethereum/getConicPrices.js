import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { ethereumWeb3 as web3 } from '../../../utils/web3';
import { multicallAddress } from '../../../utils/web3';
import pools from '../../../data/ethereum/conicPools.json';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import { getContract } from '../../../utils/contractHelper';
import IConicPool from '../../../abis/ethereum/IConicPool.json';

export const getConicPrices = async () => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const priceCalls = pools.map(pool => ({
    price: getContract(IConicPool, pool.address).methods.usdExchangeRate(),
  }));
  const res = await multicall.all([priceCalls]);

  const prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    prices[pool.name] = new BigNumber(res[0][i].price).div('1e18').toNumber();
  }
  return prices;
};
