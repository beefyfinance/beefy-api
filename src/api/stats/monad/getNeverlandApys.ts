import { BigNumber } from 'bignumber.js';
import jp from 'jsonpath';
import type { Address } from 'viem';
import IAaveV3PoolDataProvider from '../../../abis/AaveV3PoolDataProvider.ts';
import NeverlandIncentiveController from '../../../abis/monad/NeverlandIncentiveController.ts';
import { MONAD_CHAIN_ID } from '../../../constants.ts';
import { BIG_ZERO } from '../../../utils/big-number.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getMerklApys } from '../common/curve/getCurveApysCommon.js';
import { type ApyBreakdownResult, getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import pools from '../../../data/monad/neverlandPools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'apy', platform: 'neverland', chain: MONAD_CHAIN_ID });

const aaveProtocolDataProvider = '0xfd0b6b6F736376F7B99ee989c749007c7757fDba';
const neverlandIncentiveController = '0x57ea245cCbFAb074baBb9d01d1F0c60525E52cec';
const rewardId = 'DUST';
const rewardAddress = '0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c';
const rewardDecimals = '1e18';
const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';
const burn = 0.5;

export const getNeverlandApys = async (): Promise<ApyBreakdownResult> => {
  const farmAprs: BigNumber[] = [];

  const [{ supplyAprs, suppliesInUsd }, rewardInUsdPerSecond, liquidStakingAprs, merklApys] = await Promise.all([
    getPoolData(),
    getIncentiveControllerData(),
    getLiquidStakingData(),
    getMerklApys(MONAD_CHAIN_ID, pools),
  ]);

  for (let i = 0; i < pools.length; ++i) {
    const farmApr = rewardInUsdPerSecond[i].dividedBy(suppliesInUsd[i]).times(secondsPerYear);
    farmAprs.push(farmApr.plus(merklApys[i]));
  }

  return getApyBreakdown(
    pools.map((pool, i) => ({
      vaultId: pool.name,
      lending: supplyAprs[pool.address.toLowerCase()],
      vault: farmAprs[i],
      liquidStaking: liquidStakingAprs[i],
    }))
  );
};

const getPoolData = async () => {
  const supplyAprs: Record<string, BigNumber> = Object.fromEntries(
    pools.map(pool => [pool.address.toLowerCase(), BIG_ZERO])
  );
  const suppliesInUsd: BigNumber[] = pools.map(() => BIG_ZERO);

  const dataProvider = fetchContract(aaveProtocolDataProvider, IAaveV3PoolDataProvider, MONAD_CHAIN_ID);
  await Promise.allSettled(
    pools.map(async (pool, i) => {
      const [poolData, tokenPrice] = await Promise.all([
        dataProvider.read.getReserveData([pool.address as Address]),
        fetchPrice({ oracle: 'tokens', id: pool.oracleId }),
      ]);

      // 5=liquidityRate
      supplyAprs[pool.address.toLowerCase()] = new BigNumber(poolData[5].toString()).dividedBy(RAY_DECIMALS);

      // 2=totalAToken
      suppliesInUsd[i] = new BigNumber(poolData[2].toString()).dividedBy(pool.decimals).times(tokenPrice);
    })
  );

  return { supplyAprs, suppliesInUsd };
};

const getIncentiveControllerData = async (): Promise<BigNumber[]> => {
  const incentivesControllerContract = fetchContract(
    neverlandIncentiveController,
    NeverlandIncentiveController,
    MONAD_CHAIN_ID
  );
  const poolInfoCalls = pools.map(pool => {
    return incentivesControllerContract.read.getRewardsData([pool.aToken as Address, rewardAddress]);
  });
  const poolInfos = await Promise.all(poolInfoCalls);
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardId });
  const nowInSeconds = Date.now() / 1000;
  const rewardInUsdPerSecond: BigNumber[] = poolInfos.map(poolInfo => {
    // 3=distributionEnd
    const distributionEnd = new BigNumber(poolInfo[3].toString());
    if (distributionEnd.lt(nowInSeconds)) {
      return new BigNumber(0);
    }

    // 1=emissionPerSecond
    return new BigNumber(poolInfo[1].toString()).dividedBy(rewardDecimals).times(rewardPrice).times(burn);
  });

  return rewardInUsdPerSecond;
};

const getLiquidStakingData = async (): Promise<number[]> => {
  // Fetch once
  const uniqueUrls = [...new Set(pools.filter(p => !!p.lsUrl).map(p => p.lsUrl!))];
  const responseByUrl = new Map<string, any>();

  await Promise.all(
    uniqueUrls.map(async url => {
      try {
        responseByUrl.set(url, await fetch(url).then(res => res.json()));
      } catch {
        responseByUrl.set(url, null);
        logger.warn({ url }, 'failed to fetch liquid staking apr');
      }
    })
  );

  // Map by pool so the result stays index-aligned with `pools` even when a fetch/parse fails.
  return pools.map(pool => {
    if (pool.lsUrl) {
      const response = responseByUrl.get(pool.lsUrl);
      if (response == null) return 0; // fetch failed
      try {
        const lsAprFactor: number = pool.lsAprFactor || 1;
        let lsApr = jp.query(response, pool.dataPath!)[0];
        if (String(lsApr).includes('%')) {
          lsApr = Number(String(lsApr).replace('%', ''));
        }
        return (Number(lsApr) * lsAprFactor) / 100;
      } catch {
        logger.warn({ pool: pool.name, url: pool.lsUrl }, 'failed to parse liquid staking apr');
        return 0;
      }
    }
    if (pool.lstApr) return pool.lstApr;
    return 0;
  });
};

export default getNeverlandApys;
