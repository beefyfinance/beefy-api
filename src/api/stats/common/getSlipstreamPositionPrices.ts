import {
  type Address,
  BaseError,
  ContractFunctionRevertedError,
  decodeFunctionResult,
  encodeFunctionData,
  maxUint128,
  maxUint256,
} from 'viem';
import SlipstreamPositionManagerAbi from '../../../abis/SlipstreamPositionManager.ts';
import type { StandardLpBreakdown } from '../../../types/prices.ts';
import type { ApiChainId } from '../../../utils/chain.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { withTracing } from '../../../utils/tracing.ts';
import { fetchContract, fetchNoMulticallContract } from '../../rpc/client.ts';
import { getPrice, type PositionTokens, type UniV3Pool } from './getUniV3PositionPrices.ts';

const logger = getLoggerFor({ module: 'prices', component: 'slipstream' });

interface SlipstreamPositionPricesParams {
  pools: UniV3Pool[];
  tokenPrices: Record<string, number>;
  chainId: ApiChainId;
  nftManager: string;
}

// The BeefyUniswapPositionHelper reverts on Slipstream positions, so simulate a full withdrawal instead
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

/** Amounts include uncollected fees, which positions() only updates when the position is modified */
const getPositionTokens = async (pool: UniV3Pool, params: SlipstreamPositionPricesParams): Promise<PositionTokens> => {
  const tokenId = BigInt(pool.nftId);
  const nftManager = fetchContract(params.nftManager, SlipstreamPositionManagerAbi, params.chainId);
  const position = await nftManager.read.positions([tokenId]).catch(err => {
    // Burned NFTs revert with 'ID'; anything else (e.g. RPC errors viem also labels as reverts) should still throw
    const revert = err instanceof BaseError && err.walk(e => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError && revert.reason === 'ID') return undefined;
    throw err;
  });
  if (!position) {
    logger.warn({ chain: params.chainId, nftId: pool.nftId }, 'position burned, using 0');
    return [0n, 0n, 0n];
  }
  const owner = await nftManager.read.ownerOf([tokenId]);
  const liquidity = position[7];

  const calls = [
    encodeFunctionData({
      abi: SlipstreamPositionManagerAbi,
      functionName: 'collect',
      args: [{ tokenId, recipient: owner, amount0Max: maxUint128, amount1Max: maxUint128 }],
    }),
  ];
  // decreaseLiquidity reverts on 0 liquidity
  if (liquidity > 0n) {
    calls.unshift(
      encodeFunctionData({
        abi: SlipstreamPositionManagerAbi,
        functionName: 'decreaseLiquidity',
        args: [{ tokenId, liquidity, amount0Min: 0n, amount1Min: 0n, deadline: maxUint256 }],
      })
    );
  }

  // Not batched via Multicall3, which would make it the sender instead of the owner
  const simulator = fetchNoMulticallContract(params.nftManager, SlipstreamPositionManagerAbi, params.chainId);
  const { result } = await simulator.simulate.multicall([calls], { account: owner as Address });
  const [amount0, amount1] = decodeFunctionResult({
    abi: SlipstreamPositionManagerAbi,
    functionName: 'collect',
    data: result[result.length - 1],
  });

  return [amount0, amount1, liquidity];
};
