import { addressBookByChainId, ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import ICurvePoolAbi from '../abis/CurvePool.ts';
import ICurvePoolV2Abi from '../abis/CurvePoolV2.ts';
import { fetchContract } from '../api/rpc/client.ts';
import type { PricesById } from '../types/prices.ts';
import { bigintDecimals } from './big-int.ts';
import { toChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { typedEntries } from './object.ts';
import { isValidPrice } from './prices.ts';
import { contextAllSettled, isContextResultRejected } from './promise.ts';
import { withTracing } from './tracing.ts';
import arbitrumCurvePools from '../data/arbitrum/curvePools.json' with { type: 'json' };
import ethereumConvexPools from '../data/ethereum/convexPools.json' with { type: 'json' };
import ethereumFxPools from '../data/ethereum/fxPools.json' with { type: 'json' };
import fraxtalCurvePools from '../data/fraxtal/curvePools.json' with { type: 'json' };
import maticCurvePools from '../data/matic/curvePools.json' with { type: 'json' };
import monadCurvePools from '../data/monad/curvePools.json' with { type: 'json' };
import optimismCurvePools from '../data/optimism/curvePools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'prices', component: 'curve' });

type Context = {
  token: CurveToken;
  chainId: ChainId;
};
type ReadAmountOutFn = (ctx: Context) => Promise<bigint>;
type SourceTypeFunctions = {
  readAmountOut: ReadAmountOutFn;
};

/** Amount of secondToken received for one whole unit of oracleId */
const sourceTypes = {
  v1: {
    async readAmountOut({ token, chainId }: Context) {
      const contract = fetchContract(token.pool, ICurvePoolAbi, chainId);
      return contract.read.get_dy([BigInt(token.index0), BigInt(token.index1), bigintDecimals(token.decimals)]);
    },
  },
  v2: {
    async readAmountOut({ token, chainId }: Context) {
      const contract = fetchContract(token.pool, ICurvePoolV2Abi, chainId);
      return contract.read.get_dy([BigInt(token.index0), BigInt(token.index1), bigintDecimals(token.decimals)]);
    },
  },
  'v1-underlying': {
    async readAmountOut({ token, chainId }: Context) {
      const contract = fetchContract(token.pool, ICurvePoolAbi, chainId);
      return contract.read.get_dy_underlying([
        BigInt(token.index0),
        BigInt(token.index1),
        bigintDecimals(token.decimals),
      ]);
    },
  },
} as const satisfies Record<string, SourceTypeFunctions>;

type SourceType = keyof typeof sourceTypes;

function isSourceType(value: string): value is SourceType {
  return Object.hasOwn(sourceTypes, value);
}

/** '1e18' -> 18 */
function toDecimals(value: string): number {
  const num = /^1e(\d+)$/.exec(value)?.[1];
  if (num === undefined) {
    throw new Error(`Invalid decimals ${value}`);
  }

  return Number(num);
}

const tokens = {
  optimism: toCurveTokens(ChainId.optimism, optimismCurvePools),
  fraxtal: toCurveTokens(ChainId.fraxtal, fraxtalCurvePools).slice().reverse(),
  monad: toCurveTokens(ChainId.monad, monadCurvePools).slice().reverse(),
  arbitrum: [
    ...toCurveTokens(ChainId.arbitrum, arbitrumCurvePools),
    {
      oracleId: 'vsdCRV',
      decimals: 18,
      index0: 1,
      index1: 0,
      pool: '0x5C959D2c1a49B637Fb988c40d663265F8Bf6d289',
      secondToken: 'CRV',
      secondTokenDecimals: 18,
      type: 'v2',
    },
    {
      oracleId: 'fETH',
      decimals: 18,
      index0: 0,
      index1: 2,
      pool: '0xF7Fed8Ae0c5B78c19Aadd68b700696933B0Cefd9',
      secondToken: 'ETH',
      secondTokenDecimals: 18,
      type: 'v2',
    },
    {
      oracleId: 'xETH',
      decimals: 18,
      index0: 1,
      index1: 2,
      pool: '0xF7Fed8Ae0c5B78c19Aadd68b700696933B0Cefd9',
      secondToken: 'ETH',
      secondTokenDecimals: 18,
      type: 'v2',
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
      decimals: 18,
      index0: 0,
      index1: 1,
      pool: '0xa4c567c662349BeC3D0fB94C4e7f85bA95E208e4',
      secondToken: 'WETH',
      secondTokenDecimals: 18,
      type: 'v1',
    },
    {
      oracleId: 'sFRAX',
      decimals: 18,
      index0: 1,
      index1: 0,
      pool: '0xfEF79304C80A694dFd9e603D624567D470e1a0e7',
      secondToken: 'crvUSD',
      secondTokenDecimals: 18,
      type: 'v1',
    },
    {
      oracleId: 'MAI',
      decimals: 18,
      index0: 0,
      index1: 2,
      pool: '0x66E335622ad7a6C9c72c98dbfCCE684996a20Ef9',
      secondToken: 'USDC',
      secondTokenDecimals: 6,
      type: 'v1-underlying',
    },
  ],
} satisfies Partial<Record<keyof typeof ChainId, CurveToken[]>>;

type CurveToken = {
  oracleId: string;
  decimals: number;
  index0: number;
  index1: number;
  pool: Address;
  secondToken: string;
  secondTokenDecimals: number;
  type: SourceType;
};

type CurvePoolConfig = {
  pool: string;
  tokens: { oracleId?: string; decimals: string; oracle?: string; basePool?: string }[];
  getDy?: (string | number)[];
};

type GetDy = [version: string, index0: number, index1: number, underlyingId?: string];

function isGetDy(value: unknown[] | undefined): value is GetDy {
  if (value === undefined || (value.length !== 3 && value.length !== 4)) {
    return false;
  }

  const [version, index0, index1, underlyingId] = value;
  return (
    typeof version === 'string'
    && typeof index0 === 'number'
    && typeof index1 === 'number'
    && (underlyingId === undefined || typeof underlyingId === 'string')
  );
}

function toCurveTokens(chainId: ChainId, pools: CurvePoolConfig[]): CurveToken[] {
  return pools
    .filter(p => p.getDy !== undefined)
    .map(p => {
      if (!isGetDy(p.getDy)) {
        throw new Error(`Curve pool ${p.pool} has invalid getDy ${JSON.stringify(p.getDy)}`);
      }

      const [version, index0, index1, underlyingId] = p.getDy;
      const oracleId = p.tokens[index0].oracleId;
      if (!oracleId) {
        throw new Error(`Curve pool ${p.pool} token ${index0} has no oracleId`);
      }

      const decimals = toDecimals(p.tokens[index0].decimals);
      const useUnderlying = underlyingId !== undefined;
      const secondToken = useUnderlying ? underlyingId : p.tokens[index1].oracleId;
      if (!secondToken) {
        throw new Error(`Curve pool ${p.pool} token ${index1} has no oracleId`);
      }

      const secondTokenDecimals = useUnderlying
        ? addressBookByChainId[chainId].tokens[underlyingId].decimals
        : toDecimals(p.tokens[index1].decimals);
      const type = useUnderlying ? `${version}-underlying` : version;
      if (!isSourceType(type)) {
        throw new Error(`Curve pool ${p.pool} has unsupported getDy type ${type}`);
      }

      return {
        pool: p.pool as Address,
        oracleId,
        decimals,
        index0,
        index1,
        secondToken,
        secondTokenDecimals,
        type,
      };
    });
}

async function getCurveTokenPrices(
  tokenPrices: PricesById,
  chainTokens: CurveToken[],
  chainId: ChainId
): Promise<PricesById> {
  const contexts = chainTokens.map((token): Context => ({ token, chainId }));

  const amountResults = await contextAllSettled(contexts, async (ctx: Context) => {
    const source = sourceTypes[ctx.token.type];
    if (!source) {
      throw new Error(`Incorrectly configured curve price, unexpected type ${ctx.token.type}`);
    }
    return source.readAmountOut(ctx);
  });

  // sequential, so an entry can use the price of a token listed above it
  const prices: PricesById = {};
  for (const result of amountResults) {
    const { oracleId, secondToken, secondTokenDecimals, pool } = result.context.token;
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

    const externalPrice = tokenPrices[secondToken];
    const secondPrice = isValidPrice(externalPrice) ? externalPrice : prices[secondToken];
    if (!isValidPrice(secondPrice)) {
      logger.warn({ ...fields, second: secondToken }, 'missing second token price');
      continue;
    }

    const price = new BigNumber(result.value).times(secondPrice).shiftedBy(-secondTokenDecimals).toNumber();
    if (!isValidPrice(price)) {
      logger.warn({ ...fields, price }, 'invalid price calculated');
      continue;
    }

    prices[oracleId] = price;
  }

  return prices;
}

export const fetchCurveTokenPrices = withTracing(
  async (tokenPrices: PricesById): Promise<PricesById> => {
    const pricesByChain = await Promise.all(
      typedEntries(tokens).map(([chainId, chainTokens]) =>
        getCurveTokenPrices(tokenPrices, chainTokens, toChainId(chainId))
      )
    );

    return Object.assign({}, ...pricesByChain);
  },
  { logger }
);
