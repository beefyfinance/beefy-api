import BigNumber from 'bignumber.js';

import { SingleAssetPool } from '../../../../types/LpPool';
import { fetchContract } from '../../../rpc/client';
import { ChainId } from '../../../../../packages/address-book/address-book';
import SwapAbi from '../../../../abis/common/Swap/Swap';

// gets the prices of LPToken contracts deployed from Swap contracts.
// Example is IronSwap (0x837503e8A8753ae17fB8C8151B8e6f586defCb57) on polygon

interface SwapPricesParams {
  chainId: ChainId;
  pools: SingleAssetPool[];
}

const getSwapPrices = async ({
  chainId,
  pools,
}: SwapPricesParams): Promise<Record<string, number>> => {
  // create closure of _getPrice with web3 to avoid passing in web3 every time
  const getPrice = (pool: SingleAssetPool) => {
    return _getPrice(chainId, pool);
  };

  const swapPools = pools.filter(pool => pool.swap !== undefined);

  const promises: Promise<[string, number]>[] = [];
  swapPools.forEach(pool => promises.push(getPrice(pool)));
  const values = await Promise.all(promises);

  const prices: Record<string, number> = {};

  values.forEach(poolTokenPrice => {
    const [name, price] = poolTokenPrice;
    prices[name] = price;
  });

  return prices;
};

const _getPrice = async (chainId: ChainId, pool: SingleAssetPool): Promise<[string, number]> => {
  const swapContract = fetchContract(pool.swap, SwapAbi, chainId);
  const virtualPrice = await swapContract.read.getVirtualPrice();
  const tokenPrice = new BigNumber(virtualPrice.toString()).dividedBy(pool.decimals).toNumber();

  return [pool.name, tokenPrice];
};

export { getSwapPrices };
