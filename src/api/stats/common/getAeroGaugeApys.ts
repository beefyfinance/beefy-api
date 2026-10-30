import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import { isDefined } from '../../../utils/array.ts';
import type { ApiChainId } from '../../../utils/chain.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { SECONDS_PER_YEAR } from '../../../utils/time.ts';
import { getRPCClient } from '../../rpc/client.ts';
import { type ApyBreakdownRequest, getApyBreakdown } from './getApyBreakdownNew.ts';

const LOOKBACK_SECONDS = 24 * 60 * 60;
const REWARD_PRECISION = new BigNumber('1e18');

const gaugeAbi = [
  {
    inputs: [],
    name: 'projectedRewardPerToken',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type AeroGaugePool = {
  name: string;
  gauge: string;
  decimals: string;
  beefyFee?: number;
};

type AeroGaugeApyParams = {
  chainId: ApiChainId;
  pools: AeroGaugePool[];
  rewardOracleId: string;
  rewardDecimals: number;
  secondsPerBlock: number;
};

export const getAeroGaugeApys = async ({
  chainId,
  pools,
  rewardOracleId,
  rewardDecimals,
  secondsPerBlock,
}: AeroGaugeApyParams) => {
  const logger = getLoggerFor({ module: 'apy', component: 'aero', chain: chainId });
  const client = getRPCClient(chainId);
  const rewardTokenScale = new BigNumber(`1e${rewardDecimals}`);

  const currentBlock = await client.getBlockNumber();
  const previousBlock = currentBlock - BigInt(Math.ceil(LOOKBACK_SECONDS / secondsPerBlock));

  const [currentBlockData, previousBlockData] = await Promise.all([
    client.getBlock({ blockNumber: currentBlock }),
    client.getBlock({ blockNumber: previousBlock }),
  ]);
  const elapsedSeconds = Number(currentBlockData.timestamp - previousBlockData.timestamp);

  const getPoolApr = async (pool: AeroGaugePool) => {
    const gaugeAddress = pool.gauge as Address;

    const [currentRewardPerToken, previousRewardPerToken, totalSupply, rewardPrice, lpPrice] = await Promise.all([
      client.readContract({
        address: gaugeAddress,
        abi: gaugeAbi,
        functionName: 'projectedRewardPerToken',
        blockNumber: currentBlock,
      }),
      client.readContract({
        address: gaugeAddress,
        abi: gaugeAbi,
        functionName: 'projectedRewardPerToken',
        blockNumber: previousBlock,
      }),
      client.readContract({
        address: gaugeAddress,
        abi: gaugeAbi,
        functionName: 'totalSupply',
        blockNumber: currentBlock,
      }),
      fetchPrice({ oracle: 'tokens', id: rewardOracleId }),
      fetchPrice({ oracle: 'lps', id: pool.name }),
    ]);

    if (
      totalSupply === 0n
      || elapsedSeconds <= 0
      || currentRewardPerToken <= previousRewardPerToken
      || rewardPrice <= 0
      || lpPrice <= 0
    ) {
      return new BigNumber(0);
    }

    // Gauge reward-per-token values use 1e18 precision and accrue reward-token units per LP-token unit.
    const rewardPerLpPerYear = new BigNumber(currentRewardPerToken - previousRewardPerToken)
      .times(pool.decimals)
      .times(SECONDS_PER_YEAR)
      .dividedBy(REWARD_PRECISION.times(elapsedSeconds).times(rewardTokenScale));

    return rewardPerLpPerYear.times(rewardPrice).dividedBy(lpPrice);
  };

  const requests = await Promise.all(
    pools.map(async (pool): Promise<ApyBreakdownRequest | undefined> => {
      try {
        return { vaultId: pool.name, beefyFee: pool.beefyFee, vault: await getPoolApr(pool) };
      } catch (err) {
        logger.warn({ err, pool: pool.name }, 'pool apy calculation failed');
        return undefined;
      }
    })
  );

  return getApyBreakdown(requests.filter(isDefined));
};
