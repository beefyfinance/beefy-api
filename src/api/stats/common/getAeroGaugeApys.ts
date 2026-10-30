import { BigNumber } from 'bignumber.js';
import { type Address, parseAbi, zeroAddress } from 'viem';
import { isDefined } from '../../../utils/array.ts';
import type { ApiChainId } from '../../../utils/chain.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { isValidPrice } from '../../../utils/prices.ts';
import { SECONDS_PER_YEAR } from '../../../utils/time.ts';
import { fetchContract } from '../../rpc/client.ts';
import { type ApyBreakdownRequest, getApyBreakdown } from './getApyBreakdownNew.ts';

const gaugeAbi = parseAbi(['function gaugeFactory() view returns (address)']);
const gaugeFactoryAbi = parseAbi(['function gaugeTape() view returns (address)']);
const gaugeTapeAbi = parseAbi([
  'function observe(address gauge, uint48[] secondsAgo) view returns ((uint224 rewardPerToken, uint32 blockTimestamp)[])',
]);

const LOOKBACK_SECONDS = 24 * 60 * 60;
const REWARD_PER_TOKEN_PRECISION = 18;

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
};

export const getAeroGaugeApys = async ({ chainId, pools, rewardOracleId, rewardDecimals }: AeroGaugeApyParams) => {
  const logger = getLoggerFor({ module: 'apy', component: 'aero', chain: chainId });
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardOracleId });
  const rewardScale = new BigNumber(10).pow(REWARD_PER_TOKEN_PRECISION + rewardDecimals);

  const tapeByFactory = new Map<Address, Promise<Address>>();
  const getTape = (factory: Address) => {
    let tape = tapeByFactory.get(factory);
    if (!tape) {
      tape = fetchContract(factory, gaugeFactoryAbi, chainId).read.gaugeTape();
      tapeByFactory.set(factory, tape);
    }
    return tape;
  };

  const getPoolApr = async (pool: AeroGaugePool) => {
    const factory = await fetchContract(pool.gauge, gaugeAbi, chainId).read.gaugeFactory();
    const tape = await getTape(factory);
    if (tape === zeroAddress) {
      return new BigNumber(0);
    }
    const [[start, end], lpPrice] = await Promise.all([
      fetchContract(tape, gaugeTapeAbi, chainId).read.observe([pool.gauge as Address, [LOOKBACK_SECONDS, 0]]),
      fetchPrice({ oracle: 'lps', id: pool.name }),
    ]);

    const elapsed = end.blockTimestamp - start.blockTimestamp;
    if (elapsed <= 0 || !isValidPrice(rewardPrice) || !isValidPrice(lpPrice)) {
      return new BigNumber(0);
    }

    return new BigNumber((end.rewardPerToken - start.rewardPerToken).toString())
      .times(pool.decimals)
      .dividedBy(rewardScale)
      .times(rewardPrice)
      .times(SECONDS_PER_YEAR)
      .dividedBy(elapsed)
      .dividedBy(lpPrice);
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
