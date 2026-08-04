import type { PricesById } from '../types/prices.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'prices', component: 'coingecko' });

type CoinGeckoPricesResponse = Record<string, { usd: number }>;

const fetchCoinGeckoPrices = async (coins: string[] | undefined): Promise<PricesById> => {
  if (!coins) return {};
  const ids = coins.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  let prices: PricesById = {};
  try {
    // FIXME(unsafe-cast): unchecked response shape
    const data = (await fetch(url).then(res => res.json())) as CoinGeckoPricesResponse;
    Object.keys(data).forEach(coin => {
      const price = Number(data[coin].usd);
      prices = { ...prices, ...{ [coin]: price } };
    });
  } catch (e) {
    logger.warn({ err: e }, 'failed to fetch coingecko prices');
  }
  return prices;
};

export { fetchCoinGeckoPrices };
