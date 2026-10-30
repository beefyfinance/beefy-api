import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import { isDefined } from '../../../utils/array.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { SECONDS_PER_YEAR } from '../../../utils/time.ts';
import { getRPCClient } from '../../rpc/client.ts';
import { type ApyBreakdownRequest, getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import pools from '../../../data/optimism/aeroLpPools.json' with { type: 'json' };

const {
  optimism: {
    tokens: { xAERO },
  },
} = addressBook;

const logger = getLoggerFor({ module: 'apy', component: 'aero', chain: ApiChainId.optimism });

const LOOKBACK_SECONDS = 24 * 60 * 60;
const OPTIMISM_SECONDS_PER_BLOCK = 2;
const REWARD_PRECISION = new BigNumber('1e18');
const REWARD_TOKEN_SCALE = new BigNumber(`1e${xAERO.decimals}`);

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

const getPoolApy = async (
  pool: (typeof pools)[number],
  currentBlock: bigint,
  previousBlock: bigint,
  elapsedSeconds: number
) => {
  const client = getRPCClient(ApiChainId.optimism);
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
    fetchPrice({ oracle: 'tokens', id: xAERO.oracleId }),
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
    .dividedBy(REWARD_PRECISION.times(elapsedSeconds).times(REWARD_TOKEN_SCALE));

  return rewardPerLpPerYear.times(rewardPrice).dividedBy(lpPrice);
};

const getAeroApys = async () => {
  const client = getRPCClient(ApiChainId.optimism);
  const currentBlock = await client.getBlockNumber();
  const previousBlock = currentBlock - BigInt(Math.ceil(LOOKBACK_SECONDS / OPTIMISM_SECONDS_PER_BLOCK));

  const [currentBlockData, previousBlockData] = await Promise.all([
    client.getBlock({ blockNumber: currentBlock }),
    client.getBlock({ blockNumber: previousBlock }),
  ]);
  const elapsedSeconds = Number(currentBlockData.timestamp - previousBlockData.timestamp);

  const requests = await Promise.all(
    pools.map(async (pool): Promise<ApyBreakdownRequest | undefined> => {
      try {
        return {
          vaultId: pool.name,
          beefyFee: pool.beefyFee,
          vault: await getPoolApy(pool, currentBlock, previousBlock, elapsedSeconds),
        };
      } catch (err) {
        logger.warn({ err, pool: pool.name }, 'pool apy calculation failed');
        return undefined;
      }
    })
  );

  return getApyBreakdown(requests.filter(isDefined));
};

export default getAeroApys;
