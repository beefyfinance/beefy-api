import ISlipstreamPool from '../../../abis/ISlipstreamPool.ts';
import SlipstreamPositionManagerAbi from '../../../abis/SlipstreamPositionManager.ts';
import type { StandardLpBreakdown } from '../../../types/prices.ts';
import type { ApiChainId } from '../../../utils/chain.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { withTracing } from '../../../utils/tracing.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getPrice, type PositionTokens, type UniV3Pool } from './getUniV3PositionPrices.ts';

const logger = getLoggerFor({ module: 'prices', component: 'slipstream' });

interface SlipstreamPositionPricesParams {
  pools: UniV3Pool[];
  tokenPrices: Record<string, number>;
  chainId: ApiChainId;
  nftManager: string;
}

// Position amounts are computed locally since the BeefyUniswapPositionHelper is not deployed on every chain
export const getSlipstreamPositionPrices = withTracing(
  async (params: SlipstreamPositionPricesParams): Promise<Record<string, StandardLpBreakdown>> => {
    const positionTokens = await Promise.all(params.pools.map(pool => getPositionTokens(pool, params)));
    const prices: Record<string, StandardLpBreakdown> = {};

    for (let i = 0; i < params.pools.length; i++) {
      Object.assign(prices, getPrice(params.pools[i], positionTokens[i], params.tokenPrices));
    }

    return prices;
  },
  { logger, fieldsFn: (params: SlipstreamPositionPricesParams) => ({ chain: params.chainId }) }
);

const getPositionTokens = async (pool: UniV3Pool, params: SlipstreamPositionPricesParams): Promise<PositionTokens> => {
  const nftManager = fetchContract(params.nftManager, SlipstreamPositionManagerAbi, params.chainId);
  const poolContract = fetchContract(pool.address, ISlipstreamPool, params.chainId);
  const [position, slot0] = await Promise.all([
    nftManager.read.positions([BigInt(pool.nftId)]),
    poolContract.read.slot0(),
  ]);
  const [, , , , , tickLower, tickUpper, liquidity] = position;
  const [amount0, amount1] = getAmountsForLiquidity(
    slot0[0],
    getSqrtRatioAtTick(tickLower),
    getSqrtRatioAtTick(tickUpper),
    liquidity
  );
  return [amount0, amount1, liquidity];
};

const Q96 = 1n << 96n;
const MAX_UINT256 = (1n << 256n) - 1n;

// Port of Uniswap V3 TickMath.getSqrtRatioAtTick
const getSqrtRatioAtTick = (tick: number): bigint => {
  const absTick = BigInt(Math.abs(tick));
  let ratio = absTick & 0x1n ? 0xfffcb933bd6fad37aa2d162d1a594001n : 0x100000000000000000000000000000000n;
  const factors: [bigint, bigint][] = [
    [0x2n, 0xfff97272373d413259a46990580e213an],
    [0x4n, 0xfff2e50f5f656932ef12357cf3c7fdccn],
    [0x8n, 0xffe5caca7e10e4e61c3624eaa0941cd0n],
    [0x10n, 0xffcb9843d60f6159c9db58835c926644n],
    [0x20n, 0xff973b41fa98c081472e6896dfb254c0n],
    [0x40n, 0xff2ea16466c96a3843ec78b326b52861n],
    [0x80n, 0xfe5dee046a99a2a811c461f1969c3053n],
    [0x100n, 0xfcbe86c7900a88aedcffc83b479aa3a4n],
    [0x200n, 0xf987a7253ac413176f2b074cf7815e54n],
    [0x400n, 0xf3392b0822b70005940c7a398e4b70f3n],
    [0x800n, 0xe7159475a2c29b7443b29c7fa6e889d9n],
    [0x1000n, 0xd097f3bdfd2022b8845ad8f792aa5825n],
    [0x2000n, 0xa9f746462d870fdf8a65dc1f90e061e5n],
    [0x4000n, 0x70d869a156d2a1b890bb3df62baf32f7n],
    [0x8000n, 0x31be135f97d08fd981231505542fcfa6n],
    [0x10000n, 0x9aa508b5b7a84e1c677de54f3e99bc9n],
    [0x20000n, 0x5d6af8dedb81196699c329225ee604n],
    [0x40000n, 0x2216e584f5fa1ea926041bedfe98n],
    [0x80000n, 0x48a170391f7dc42444e8fa2n],
  ];
  for (const [mask, factor] of factors) {
    if (absTick & mask) ratio = (ratio * factor) >> 128n;
  }
  if (tick > 0) ratio = MAX_UINT256 / ratio;
  return (ratio >> 32n) + (ratio % (1n << 32n) === 0n ? 0n : 1n);
};

const getAmountsForLiquidity = (
  sqrtPriceX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): [bigint, bigint] => {
  const amount0 = (sqrtA: bigint, sqrtB: bigint) => ((liquidity << 96n) * (sqrtB - sqrtA)) / sqrtB / sqrtA;
  const amount1 = (sqrtA: bigint, sqrtB: bigint) => (liquidity * (sqrtB - sqrtA)) / Q96;

  if (sqrtPriceX96 <= sqrtRatioAX96) return [amount0(sqrtRatioAX96, sqrtRatioBX96), 0n];
  if (sqrtPriceX96 < sqrtRatioBX96) {
    return [amount0(sqrtPriceX96, sqrtRatioBX96), amount1(sqrtRatioAX96, sqrtPriceX96)];
  }
  return [0n, amount1(sqrtRatioAX96, sqrtRatioBX96)];
};
