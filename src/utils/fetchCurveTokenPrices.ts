import { addressBookByChainId, ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import ICurvePoolAbi from '../abis/CurvePool.ts';
import ICurvePoolV2Abi from '../abis/CurvePoolV2.ts';
import type StableSwap from '../abis/StableSwap.ts';
import { fetchContract } from '../api/rpc/client.ts';
import type { PricesById } from '../types/prices.ts';
import { toChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { typedEntries } from './object.ts';
import arbitrumCurvePools from '../data/arbitrum/curvePools.json' with { type: 'json' };
import ethereumConvexPools from '../data/ethereum/convexPools.json' with { type: 'json' };
import ethereumFxPools from '../data/ethereum/fxPools.json' with { type: 'json' };
import fraxtalCurvePools from '../data/fraxtal/curvePools.json' with { type: 'json' };
import maticCurvePools from '../data/matic/curvePools.json' with { type: 'json' };
import monadCurvePools from '../data/monad/curvePools.json' with { type: 'json' };
import optimismCurvePools from '../data/optimism/curvePools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'prices', platform: 'curve' });

const tokens: Partial<Record<keyof typeof ChainId, CurveToken[]>> = {
  optimism: toCurveTokens(ChainId.optimism, optimismCurvePools),
  fraxtal: toCurveTokens(ChainId.fraxtal, fraxtalCurvePools).slice().reverse(),
  monad: toCurveTokens(ChainId.monad, monadCurvePools).slice().reverse(),
  arbitrum: [
    ...toCurveTokens(ChainId.arbitrum, arbitrumCurvePools),
    {
      oracleId: 'vsdCRV',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x5c959d2c1a49b637fb988c40d663265f8bf6d289',
      secondToken: 'CRV',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2Abi,
    },
    {
      oracleId: 'fETH',
      decimals: '1e18',
      index0: 0,
      index1: 2,
      pool: '0xf7fed8ae0c5b78c19aadd68b700696933b0cefd9',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2Abi,
    },
    {
      oracleId: 'xETH',
      decimals: '1e18',
      index0: 1,
      index1: 2,
      pool: '0xf7fed8ae0c5b78c19aadd68b700696933b0cefd9',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolV2Abi,
    },
  ],
  polygon: toCurveTokens(ChainId.polygon, [...maticCurvePools]),
  ethereum: [
    ...toCurveTokens(ChainId.ethereum, [
      ...ethereumConvexPools.slice().reverse(),
      ...ethereumFxPools.slice().reverse(),
    ]),
    {
      oracleId: 'msETH',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x2d600BbBcC3F1B6Cb9910A70BaB59eC9d5F81B9A',
      secondToken: 'frxETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolAbi,
    },
    {
      oracleId: 'sFRAX',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xfEF79304C80A694dFd9e603D624567D470e1a0e7',
      secondToken: 'crvUSD',
      secondTokenDecimals: '1e18',
      abi: ICurvePoolAbi,
    },
    {
      oracleId: 'MAI',
      decimals: '1e18',
      index0: 0,
      index1: 2,
      pool: '0x66E335622ad7a6C9c72c98dbfCCE684996a20Ef9',
      useUnderlying: true,
      secondToken: 'USDC',
      secondTokenDecimals: '1e6',
      abi: ICurvePoolAbi,
    },
  ],
};

type CurveToken = {
  oracleId: string;
  decimals: string;
  index0: number;
  index1: number;
  pool: Address;
  useUnderlying?: boolean;
  secondToken: string;
  secondTokenDecimals: string;
  abi: typeof ICurvePoolV2Abi | typeof ICurvePoolAbi | typeof StableSwap;
  stableSwap?: boolean;
};

type CurvePoolConfig = {
  pool: string;
  tokens: { oracleId?: string; decimals: string; oracle?: string; basePool?: string }[];
  getDy?: (string | number)[];
};

type GetDy = [version: string, index0: number, index1: number, underlyingId?: string];

function toCurveTokens(chainId: ChainId, pools: CurvePoolConfig[]): CurveToken[] {
  return pools
    .filter(p => p.getDy !== undefined)
    .map(p => {
      const [version, index0, index1, underlyingId] = p.getDy as GetDy;
      const abi = version === 'v2' ? ICurvePoolV2Abi : ICurvePoolAbi;
      const oracleId = p.tokens[index0].oracleId;
      const decimals = p.tokens[index0].decimals;
      const useUnderlying = underlyingId !== undefined;
      const secondToken = useUnderlying ? underlyingId : p.tokens[index1].oracleId;
      const secondTokenDecimals = useUnderlying
        ? `1e${addressBookByChainId[chainId].tokens[underlyingId].decimals}`
        : p.tokens[index1].decimals;
      return {
        pool: p.pool as Address,
        abi,
        oracleId,
        decimals,
        index0,
        index1,
        useUnderlying,
        secondToken,
        secondTokenDecimals,
      };
    });
}

async function getCurveTokenPrices(
  tokenPrices: Record<string, number>,
  chainTokens: CurveToken[],
  chainId: ChainId
): Promise<number[]> {
  const curvePriceCalls = chainTokens.map(token => {
    const poolContract = fetchContract(token.pool, token.abi, chainId);
    return token.stableSwap
      ? poolContract.read.calculateSwap([
          token.index0,
          token.index1,
          BigInt(new BigNumber(token.decimals).toString(10)),
        ])
      : token.useUnderlying
        ? poolContract.read.get_dy_underlying([
            BigInt(token.index0),
            BigInt(token.index1),
            BigInt(new BigNumber(token.decimals).toString(10)),
          ])
        : poolContract.read.get_dy([
            BigInt(token.index0),
            BigInt(token.index1),
            BigInt(new BigNumber(token.decimals).toString(10)),
          ]);
  });

  try {
    const res = await Promise.all(curvePriceCalls);
    const prices: number[] = [];
    const pricesById: PricesById = {};
    for (let i = 0; i < res.length; i++) {
      const t = chainTokens[i];
      const secondPrice = tokenPrices[t.secondToken] || pricesById[t.secondToken];
      if (!secondPrice) {
        logger.warn({ oracleId: t.oracleId, token: t.secondToken, pool: t.pool }, 'missing second token price');
      }
      pricesById[t.oracleId] = new BigNumber(res[i].toString())
        .times(secondPrice ?? 0)
        .dividedBy(t.secondTokenDecimals)
        .toNumber();
      prices.push(pricesById[t.oracleId]);
    }
    return prices;
  } catch (e) {
    logger.warn({ err: e, chain: chainId }, 'curve token price fetch failed');
    return chainTokens.map(() => 0);
  }
}

export async function fetchCurveTokenPrices(tokenPrices: PricesById): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    typedEntries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getCurveTokenPrices(tokenPrices, chainTokens, toChainId(chainId));
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
