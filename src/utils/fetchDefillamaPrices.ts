import type { PricesById } from '../types/prices.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'prices', platform: 'defillama' });

type DefillamaPricesResponse = {
  coins: Record<string, { price: number }>;
};

export const fetchDefillamaPrices = async (coins: string[] | undefined): Promise<PricesById> => {
  if (!coins) return {};
  const ids = coins.map(id => `coingecko:${id}`).join(',');
  const url = `https://coins.llama.fi/prices/current/${ids}`;
  const prices: PricesById = {};
  try {
    const data = (await fetch(url).then(res => res.json())) as DefillamaPricesResponse;
    for (const [coin, { price }] of Object.entries(data.coins)) {
      const id = coin.split('coingecko:')[1];
      prices[id] = Number(price);
    }
  } catch (e) {
    logger.warn({ err: e }, 'failed to fetch defillama prices');
  }
  return prices;
};
