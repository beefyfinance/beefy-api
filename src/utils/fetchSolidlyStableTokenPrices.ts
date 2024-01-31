import ISolidlyPair from '../abis/ISolidlyPair';
import { ChainId } from '../../packages/address-book/types/chainid';
import { fetchContract } from '../api/rpc/client';
import BigNumber from 'bignumber.js';

type StablePoolLiquidityToken = {
  oracleId: string;
  pool: `0x${string}`;
  firstToken: string;
  firstTokenDecimals: string;
  secondToken: string;
  secondTokenDecimals: number;
  secondTokenAddress: `0x${string}`;
};

const tokens: Partial<Record<keyof typeof ChainId, StablePoolLiquidityToken[]>> = {
  base: [
    {
      oracleId: 'bMAI',
      pool: '0xf6Aec4F97623E691a9426a69BaF5501509fCa05D',
      firstToken: 'bMAI',
      firstTokenDecimals: '1e18',
      secondToken: 'USDbC',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    },
    {
      oracleId: 'bUSDC+',
      pool: '0xE96c788E66a97Cf455f46C5b27786191fD3bC50B',
      firstToken: 'bUSDC+',
      firstTokenDecimals: '1e6',
      secondToken: 'USD+',
      secondTokenDecimals: 1e6,
      secondTokenAddress: '0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376',
    },
  ],
};

async function getStablePoolPrices(
  tokenPrices: Record<string, number>,
  chainTokens: StablePoolLiquidityToken[],
  chainId: ChainId
): Promise<number[]> {
  const stablePoolLiquidityPriceCalls = chainTokens.map(token => {
    const tokenContract = fetchContract(token.pool, ISolidlyPair, chainId);

    const amountIn = token.secondTokenDecimals;
    const tokenIn = token.secondTokenAddress;
    return tokenContract.read.getAmountOut([BigInt(amountIn), tokenIn]);
  });

  try {
    const res = await Promise.all(stablePoolLiquidityPriceCalls);
    const tokenPrice = res.map(v => Number(v));
    const prices = {};
    tokenPrice.forEach((v, i) => {
      const second = chainTokens[i].secondToken;
      const amount = new BigNumber(v)
        .dividedBy(new BigNumber(chainTokens[i].firstTokenDecimals))
        .toNumber();
      prices[chainTokens[i].oracleId] = tokenPrices[second] / amount;
    });
    return Object.values(prices);
  } catch (e) {
    console.error('getSolidlyStableTokenPrices', e);
    return chainTokens.map(() => 0);
  }
}

export async function fetchSolidlyStableTokenPrices(tokenPrices): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getStablePoolPrices(tokenPrices, chainTokens, ChainId[chainId]);
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
