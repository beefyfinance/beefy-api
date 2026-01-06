import BigNumber from 'bignumber.js';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { fetchPrice } from '../../../utils/fetchPrice';
import { MONAD_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import { getMerklApys } from '../common/curve/getCurveApysCommon';
import jp from 'jsonpath';
import IAaveProtocolDataProviderAbi from '../../../abis/matic/AaveProtocolDataProvider';
import NeverlandIncentiveController from '../../../abis/monad/NeverlandIncentiveController';

const aaveProtocolDataProvider = '0xfd0b6b6F736376F7B99ee989c749007c7757fDba';
const neverlandIncentiveController = '0x57ea245cCbFAb074baBb9d01d1F0c60525E52cec';
const pools = require('../../../data/monad/neverlandPools.json');
const rewardId = 'DUST';
const rewardAddress = '0xAD96C3dffCD6374294e2573A7fBBA96097CC8d7c';
const rewardDecimals = '1e18';
const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';
const burn = 0.5;

export const getNeverlandApys = async (): Promise<ApyBreakdownResult> => {
  const farmAprs: BigNumber[] = [];

  const [{ supplyAprs, suppliesInUsd }, rewardInUsdPerSecond, liquidStakingAprs, merklApys] =
    await Promise.all([
      getPoolData(),
      getIncentiveControllerData(),
      getLiquidStakingData(),
      getMerklApys(MONAD_CHAIN_ID, pools),
    ]);

  for (let i = 0; i < pools.length; ++i) {
    const farmApr = rewardInUsdPerSecond[i].dividedBy(suppliesInUsd[i]).times(secondsPerYear);
    farmAprs.push(farmApr.plus(merklApys[i]));
  }

  return getApyBreakdown(pools, supplyAprs, farmAprs, 0, liquidStakingAprs);
};

const getPoolData = async () => {
  const supplyAprs: Record<string, BigNumber> = {};
  const suppliesInUsd: BigNumber[] = [];

  const dataProvider = fetchContract(aaveProtocolDataProvider, IAaveProtocolDataProviderAbi, MONAD_CHAIN_ID);
  pools.forEach(async pool => {
    const poolData = await dataProvider.read.getReserveData([pool.address]);
    const tokenPrice = await fetchPrice({ oracle: 'tokens', id: pool.oracleId });

    supplyAprs[pool.address.toLowerCase()] = new BigNumber(poolData[5].toString())
      .dividedBy(RAY_DECIMALS)
      .times(0.905); // skim lending
    suppliesInUsd.push(
      new BigNumber(poolData[0].toString())
        .plus(new BigNumber(poolData[1].toString()))
        .plus(new BigNumber(poolData[2].toString()))
        .dividedBy(pool.decimals)
        .times(tokenPrice)
    );
  });

  return { supplyAprs, suppliesInUsd };
};

const getIncentiveControllerData = async (): Promise<BigNumber[]> => {
  const incentivesControllerContract = fetchContract(
    neverlandIncentiveController,
    NeverlandIncentiveController,
    MONAD_CHAIN_ID
  );
  const poolInfoCalls = (pools as any[]).map(pool => {
    return incentivesControllerContract.read.getRewardsData([pool.aToken, rewardAddress]);
  });
  const poolInfos = await Promise.all(poolInfoCalls);
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardId });
  const rewardInUsdPerSecond: BigNumber[] = poolInfos.map(poolInfo =>
    new BigNumber(poolInfo[1].toString()).dividedBy(rewardDecimals).times(rewardPrice).times(burn)
  );

  return rewardInUsdPerSecond;
};

const getLiquidStakingData = async () => {
  let liquidStakingAprs: number[] = [];

  for (let i = 0; i < pools.length; i++) {
    if (pools[i].lsUrl) {
      let lsAprFactor: number = 1;
      if (pools[i].lsAprFactor) lsAprFactor = pools[i].lsAprFactor!;

      let lsApr: number = 0;
      try {
        const url = pools[i].lsUrl!;
        const lsResponse: any = await fetch(url).then(res => res.json());

        lsApr = jp.query(lsResponse, pools[i].dataPath!)[0];
        if (String(lsApr).includes('%')) {
          lsApr = Number(String(lsApr).replace('%', ''));
        }
        lsApr = (lsApr * lsAprFactor) / 100;
        liquidStakingAprs.push(lsApr);
      } catch {
        console.error(`Failed to fetch ${pools[i].name} liquid staking APR from ${pools[i].lsUrl}`);
      }
    } else if (pools[i].lstApr) {
      liquidStakingAprs.push(pools[i].lstApr);
    } else {
      liquidStakingAprs.push(0);
    }
  }
  return liquidStakingAprs;
};

export default getNeverlandApys;
