import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { Swap, Swap_ABI } from '../../../../abis/common/Swap';
import { SingleAssetPool } from '../../../../types/LpPool';
import { getContractWithProvider } from '../../../../utils/contractHelper';

// gets the prices of LPToken contracts deployed from Swap contracts.
// Example is IronSwap (0x837503e8A8753ae17fB8C8151B8e6f586defCb57) on polygon

interface SwapPricesParams {
  web3: Web3;
  pools: SingleAssetPool[];
}

const getSwapPrices = async ({
  web3,
  pools,
}: SwapPricesParams): Promise<Record<string, number>> => {
  // create closure of _getPrice with web3 to avoid passing in web3 every time
  const getPrice = (pool: SingleAssetPool) => {
    return _getPrice(web3, pool);
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

const _getPrice = async (web3: Web3, pool: SingleAssetPool): Promise<[string, number]> => {
  const Swap = getContractWithProvider(Swap_ABI, pool.swap, web3) as unknown as Swap;
  const virtualPrice = new BigNumber(await Swap.methods.getVirtualPrice().call());
  const tokenPrice = virtualPrice.dividedBy(pool.decimals).toNumber();

  return [pool.name, tokenPrice];
};

export { getSwapPrices };
