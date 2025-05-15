import BigNumber from 'bignumber.js';
import ICurvePoolV2 from '../abis/ICurvePoolV2.json';
import { addressBookByChainId, ChainId } from '../../packages/address-book/src/address-book';
import { fetchContract } from '../api/rpc/client';
import ICurvePoolV2Abi from '../abis/CurvePoolV2';
import ICurvePoolAbi from '../abis/CurvePool';
import ICurvePool from '../abis/ICurvePool';
import StableSwap from '../abis/StableSwap';

const tokens: Partial<Record<keyof typeof ChainId, CurveToken[]>> = {
  optimism: toCurveTokens(ChainId.optimism, require('../data/optimism/curvePools.json')),
  fraxtal: toCurveTokens(ChainId.fraxtal, require('../data/fraxtal/curvePools.json')),
  arbitrum: [
    ...toCurveTokens(ChainId.arbitrum, require('../data/arbitrum/curvePools.json')),
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
  polygon: toCurveTokens(ChainId.polygon, [...require('../data/matic/curvePools.json')]),
  ethereum: [
    ...toCurveTokens(ChainId.ethereum, [
      ...require('../data/ethereum/convexPools.json').slice().reverse(),
      ...require('../data/ethereum/fxPools.json').slice().reverse(),
    ]),
    {
      oracleId: 'msETH',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0x2d600BbBcC3F1B6Cb9910A70BaB59eC9d5F81B9A',
      secondToken: 'frxETH',
      secondTokenDecimals: '1e18',
      abi: ICurvePool,
    },
    {
      oracleId: 'cvxFPIS',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xfBB481A443382416357fA81F16dB5A725DC6ceC8',
      secondToken: 'FPIS',
      secondTokenDecimals: '1e18',
      abi: ICurvePool,
    },
    {
      oracleId: 'sFRAX',
      decimals: '1e18',
      index0: 1,
      index1: 0,
      pool: '0xfEF79304C80A694dFd9e603D624567D470e1a0e7',
      secondToken: 'crvUSD',
      secondTokenDecimals: '1e18',
      abi: ICurvePool,
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
      abi: ICurvePool,
    },
  ],
};

type CurveToken = {
  oracleId: string;
  decimals: string;
  index0: number;
  index1: number;
  pool: `0x${string}`;
  useUnderlying?: boolean;
  secondToken: string;
  secondTokenDecimals: string;
  abi: typeof ICurvePoolV2Abi | typeof ICurvePoolAbi | typeof StableSwap;
  stableSwap?: boolean;
};

function toCurveTokens(chainId, pools) {
  return pools
    .filter(p => p.getDy !== undefined)
    .map(p => {
      const abi = p.getDy[0] === 'v2' ? ICurvePoolV2 : ICurvePool;
      const index0 = p.getDy[1];
      const index1 = p.getDy[2];
      const oracleId = p.tokens[index0].oracleId;
      const decimals = p.tokens[index0].decimals;
      const useUnderlying = p.getDy[3] !== undefined;
      const secondToken = useUnderlying ? p.getDy[3] : p.tokens[index1].oracleId;
      const secondTokenDecimals = useUnderlying
        ? `1e${addressBookByChainId[chainId].tokens[p.getDy[3]].decimals}`
        : p.tokens[index1].decimals;
      return {
        pool: p.pool,
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
    const prices = [];
    const pricesById = {};
    for (let i = 0; i < res.length; i++) {
      pricesById[chainTokens[i].oracleId] = new BigNumber(res[i].toString())
        .times(tokenPrices[chainTokens[i].secondToken] || pricesById[chainTokens[i].secondToken])
        .dividedBy(chainTokens[i].secondTokenDecimals)
        .toNumber();
      prices.push(pricesById[chainTokens[i].oracleId]);
    }
    return prices;
  } catch (e) {
    console.error('getCurveTokenPrices', e);
    return chainTokens.map(() => 0);
  }
}

export async function fetchCurveTokenPrices(tokenPrices): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getCurveTokenPrices(tokenPrices, chainTokens, ChainId[chainId]);
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
