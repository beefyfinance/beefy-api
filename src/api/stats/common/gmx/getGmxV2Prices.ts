import BigNumber from 'bignumber.js';
import Reader from '../../../../abis/arbitrum/Reader';
import ERC20Abi from '../../../../abis/ERC20Abi';
import { fetchContract } from '../../../rpc/client';

export const getGmxV2Prices = async (chainId, reader, dataStore, url, pools) => {
  let prices = {};
  let promises = [];
  const tokenPrices = await getTokenPrices(url);
  pools.forEach(pool => promises.push(getPrice(chainId, reader, dataStore, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getTokenPrices = async url => {
  try {
    return await fetch(url).then(res => res.json());
  } catch (err) {
    console.error('GMX price error ', url);
  }
};

const getPrice = async (chainId: number, reader, dataStore, pool, tokenPrices) => {
  let indexPrice = {};
  if (pool.index.address != '0x0000000000000000000000000000000000000000') {
    indexPrice = tokenPrices.filter(v => v.tokenSymbol == pool.index.symbol)[0];
  } else {
    indexPrice = { minPrice: 0, maxPrice: 0 };
  }
  const longPrice = tokenPrices.filter(v => v.tokenSymbol == pool.long.symbol)[0];
  const shortPrice = tokenPrices.filter(v => v.tokenSymbol == pool.short.symbol)[0];
  const [{ price, tokens, shiftedBalances, totalSupply }] = await Promise.all([
    getLpPrice(chainId, reader, dataStore, pool, indexPrice, longPrice, shortPrice),
  ]);
  return {
    [pool.name]: {
      price: price,
      tokens: tokens,
      balances: shiftedBalances,
      totalSupply: totalSupply,
    },
  };
};

const getLpPrice = async (chainId, reader, dataStore, pool, indexPrice, longPrice, shortPrice) => {
  const readerContract = fetchContract(reader, Reader, chainId);
  const marketContract = fetchContract(pool.address, ERC20Abi, chainId);

  const result = await Promise.all([
    readerContract.read.getMarketTokenPrice([
      dataStore,
      {
        marketToken: pool.address as `0x${string}`,
        indexToken: pool.index.address as `0x${string}`,
        longToken: pool.long.address as `0x${string}`,
        shortToken: pool.short.address as `0x${string}`,
      },
      { min: indexPrice.minPrice, max: indexPrice.maxPrice },
      { min: longPrice.minPrice, max: longPrice.maxPrice },
      { min: shortPrice.minPrice, max: shortPrice.maxPrice },
      '0xdd8747ceca84c84319e46661e0ee4095cc511df8c2208b6ff4e9d2b2e6930bb6', // withdrawal type
      true,
    ]),
    marketContract.read.totalSupply(),
  ]);
  const marketPrice = new BigNumber((result[0][0] as BigInt).toString());
  const price = marketPrice.dividedBy('1e30').toNumber();
  const longAmount = new BigNumber((result[0][1].longTokenAmount as BigInt).toString());
  const shortAmount = new BigNumber((result[0][1].shortTokenAmount as BigInt).toString());
  const totalSupply = new BigNumber(result[1].toString()).dividedBy('1e18').toString();
  const tokens = [pool.long.address, pool.short.address];
  const shiftedBalances = [
    longAmount.dividedBy(pool.long.decimals).toString(),
    shortAmount.dividedBy(pool.short.decimals).toString(),
  ];
  return { price, tokens, shiftedBalances, totalSupply };
};
