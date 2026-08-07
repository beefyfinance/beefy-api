import type { ChainId } from '@beefyfinance/blockchain-addressbook/types/chainid';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import ISolidlyPair from '../abis/ISolidlyPair.ts';
import { fetchContract } from '../api/rpc/client.ts';
import type { PricesById } from '../types/prices.ts';
import { bigintDecimals } from './big-int.ts';
import { toChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { typedEntries } from './object.ts';
import { isValidPrice } from './prices.ts';
import { contextAllSettled, isContextResultRejected } from './promise.ts';
import { withTracing } from './tracing.ts';

const logger = getLoggerFor({ module: 'prices', component: 'solidly-stable' });

type StablePoolLiquidityToken = {
  oracleId: string;
  pool: Address;
  firstTokenDecimals: number;
  secondToken: string;
  secondTokenDecimals: number;
  secondTokenAddress: Address;
};

type Context = {
  token: StablePoolLiquidityToken;
  chainId: ChainId;
};

const tokens = {
  base: [
    {
      oracleId: 'bMAI',
      pool: '0xf6Aec4F97623E691a9426a69BaF5501509fCa05D',
      firstTokenDecimals: 18,
      secondToken: 'USDbC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    },
    {
      oracleId: 'bUSDC+',
      pool: '0xE96c788E66a97Cf455f46C5b27786191fD3bC50B',
      firstTokenDecimals: 6,
      secondToken: 'baseUSD+',
      secondTokenDecimals: 6,
      secondTokenAddress: '0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376',
    },
    {
      oracleId: 'jEUR',
      pool: '0xC75799e0646470128a42D07335aB3BFa9E8Ee7C2',
      firstTokenDecimals: 18,
      secondToken: 'EURC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
    },
    {
      oracleId: 'oUSDT',
      pool: '0xc84f7c63742EA1894EE04e5F49fbaE8C3a4a734d',
      firstTokenDecimals: 6,
      secondToken: 'USDC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    {
      oracleId: 'basefrxUSD',
      pool: '0xA678C47022f2E5286C51cC433be1599BBA88DF05',
      firstTokenDecimals: 18,
      secondToken: 'basemsUSD',
      secondTokenDecimals: 18,
      secondTokenAddress: '0x526728DBc96689597F85ae4cd716d4f7fCcBAE9d',
    },
  ],
  linea: [
    {
      oracleId: 'lMAI',
      pool: '0xE9E146f5bceBD71Fb8C526EA036dE6bbFB1B0Ad7',
      firstTokenDecimals: 18,
      secondToken: 'USDC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    },
    {
      oracleId: 'asUSD',
      pool: '0x7b930713103A964c12E8b808c83F57E40d9ad495',
      firstTokenDecimals: 18,
      secondToken: 'USDC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    },
  ],
  arbitrum: [
    {
      oracleId: 'USDx',
      pool: '0x340F0c6E09bb2C13df14bb4B334CC8Dba0bb4881',
      firstTokenDecimals: 18,
      secondToken: 'USDC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    },
  ],
  scroll: [
    {
      oracleId: 'loreUSD',
      pool: '0x4775dFFd8762eE4C8DE49f4FD6D02A1f0d8f1698',
      firstTokenDecimals: 18,
      secondToken: 'USDC',
      secondTokenDecimals: 6,
      secondTokenAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
    },
  ],
  bsc: [
    {
      oracleId: 'mCAKE',
      firstTokenDecimals: 18,
      pool: '0x7569Ae71A1832fa5F403471a01289222b1Daacb5',
      secondToken: 'Cake',
      secondTokenDecimals: 18,
      secondTokenAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    },
    {
      oracleId: 'mBTC',
      firstTokenDecimals: 8,
      pool: '0x01e4a13b64A35EC29C490374C0aC6a585FF7cE79',
      secondToken: 'BTCB',
      secondTokenDecimals: 18,
      secondTokenAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    },
  ],
} satisfies Partial<Record<keyof typeof ChainId, StablePoolLiquidityToken[]>>;

async function getStablePoolPrices(
  tokenPrices: PricesById,
  chainTokens: StablePoolLiquidityToken[],
  chainId: ChainId
): Promise<PricesById> {
  const contexts = chainTokens.map((token): Context => ({ token, chainId }));

  /** Amount of oracleId received for one whole secondToken */
  const amountResults = await contextAllSettled(contexts, async ({ token, chainId }: Context) => {
    const contract = fetchContract(token.pool, ISolidlyPair, chainId);
    return contract.read.getAmountOut([bigintDecimals(token.secondTokenDecimals), token.secondTokenAddress]);
  });

  const prices: PricesById = {};
  for (const result of amountResults) {
    const { oracleId, secondToken, firstTokenDecimals, pool } = result.context.token;
    const fields = { chain: chainId, oracleId, pool };

    if (isContextResultRejected(result)) {
      logger.warn({ ...fields, err: result.reason }, 'failed to read amount out');
      continue;
    }

    const amountOut = result.value;
    if (amountOut <= 0n) {
      logger.warn({ ...fields, amountOut }, 'invalid amount out read');
      continue;
    }

    const secondPrice = tokenPrices[secondToken];
    if (!isValidPrice(secondPrice)) {
      logger.warn({ ...fields, second: secondToken }, 'missing second token price');
      continue;
    }

    const price = secondPrice / new BigNumber(amountOut).shiftedBy(-firstTokenDecimals).toNumber();
    if (!isValidPrice(price)) {
      logger.warn({ ...fields, price }, 'invalid price calculated');
      continue;
    }

    prices[oracleId] = price;
  }

  return prices;
}

export const fetchSolidlyStableTokenPrices = withTracing(
  async (tokenPrices: PricesById): Promise<PricesById> => {
    const pricesByChain = await Promise.all(
      typedEntries(tokens).map(([chainId, chainTokens]) =>
        getStablePoolPrices(tokenPrices, chainTokens, toChainId(chainId))
      )
    );

    return Object.assign({}, ...pricesByChain);
  },
  { logger }
);
