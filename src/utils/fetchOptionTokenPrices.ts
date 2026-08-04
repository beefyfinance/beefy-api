import { addressBook } from '@beefyfinance/blockchain-addressbook';
import type { ChainId } from '@beefyfinance/blockchain-addressbook/types/chainid';
import type { Token } from '@beefyfinance/blockchain-addressbook/types/token';
import OptionsToken from '../abis/OptionsToken.ts';
import { fetchContract } from '../api/rpc/client.ts';
import type { PricesById } from '../types/prices.ts';
import { toChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { typedEntries } from './object.ts';
import { isValidPrice } from './prices.ts';
import { contextAllSettled, isContextResultRejected } from './promise.ts';
import { withTracing } from './tracing.ts';

const logger = getLoggerFor({ module: 'prices', component: 'option' });

const {
  linea: {
    tokens: { LYNX, oLYNX },
  },
} = addressBook;

/** An option token is exercisable at a percentage discount to its underlying */
type OptionTokenGroup = [underlying: Token, option: Token];

const tokens = {
  linea: [[LYNX, oLYNX]],
} satisfies Partial<Record<keyof typeof ChainId, OptionTokenGroup[]>>;

type Context = {
  underlying: Token;
  option: Token;
  chainId: ChainId;
};

async function getOptionTokenPrices(
  tokenPrices: PricesById,
  chainTokens: OptionTokenGroup[],
  chainId: ChainId
): Promise<PricesById> {
  const contexts = chainTokens.map(([underlying, option]): Context => ({ underlying, option, chainId }));

  /** Whole-number percentage off the underlying price */
  const discountResults = await contextAllSettled(contexts, async ({ option, chainId }: Context) => {
    const contract = fetchContract(option.address, OptionsToken, chainId);
    return contract.read.discount();
  });

  const prices: PricesById = {};
  for (const result of discountResults) {
    const { underlying, option } = result.context;
    const fields = { chain: chainId, underlying: underlying.oracleId, option: option.oracleId };

    if (isContextResultRejected(result)) {
      logger.warn({ ...fields, err: result.reason }, 'failed to read discount');
      continue;
    }

    // a full discount would price the option at zero
    const discount = result.value;
    if (discount >= 100n) {
      logger.warn({ ...fields, discount }, 'invalid discount read');
      continue;
    }

    const underlyingPrice = tokenPrices[underlying.oracleId];
    if (!isValidPrice(underlyingPrice)) {
      logger.warn(fields, 'missing underlying price');
      continue;
    }

    const price = (underlyingPrice * Number(100n - discount)) / 100;
    if (!isValidPrice(price)) {
      logger.warn({ ...fields, price }, 'invalid price calculated');
      continue;
    }

    prices[option.oracleId] = price;
  }

  return prices;
}

export const fetchOptionTokenPrices = withTracing(
  async (tokenPrices: PricesById): Promise<PricesById> => {
    const pricesByChain = await Promise.all(
      typedEntries(tokens).map(([chainId, chainTokens]) =>
        getOptionTokenPrices(tokenPrices, chainTokens, toChainId(chainId))
      )
    );

    return Object.assign({}, ...pricesByChain);
  },
  { logger }
);
