import BigNumber from 'bignumber.js';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import { fetchPrice } from '../../../utils/fetchPrice';
import { MANTLE_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import jp from 'jsonpath';
import IAaveProtocolDataProviderAbi from '../../../abis/matic/AaveProtocolDataProvider';
import LendleChefAbi from '../../../abis/mantle/LendleChef';

const aaveProtocolDataProvider = '0x552b9e4bae485C4B7F540777d7D25614CdB84773';
const lendleChef = '0x79e2fd1c484EB9EE45001A98Ce31F28918F27C41';
const pools = require('../../../data/mantle/lendlePools.json');
const rewardId = 'LEND';
const rewardDecimals = '1e18';
const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';
const burn = 0.5;


const getLendleApys = async (): Promise<ApyBreakdownResult> => {
  const farmAprs: BigNumber[] = [];

  const [{ supplyAprs, suppliesInUsd }, rewardInUsdPerSecond, liquidStakingAprs] =
    await Promise.all([getPoolData(), getIncentiveControllerData(), getLiquidStakingData()]);

  for (let i = 0; i < pools.length; ++i) {
    const farmApr = rewardInUsdPerSecond[i].dividedBy(suppliesInUsd[i]).times(secondsPerYear);
    farmAprs.push(farmApr);
  }

  return getApyBreakdown(pools, supplyAprs, farmAprs, 0, liquidStakingAprs);
};

const getPoolData = async () => {
  const supplyAprs: Record<string, BigNumber> = {};
  const suppliesInUsd: BigNumber[] = [];

  const dataProvider = fetchContract(
    aaveProtocolDataProvider,
    IAaveProtocolDataProviderAbi,
    MANTLE_CHAIN_ID
  );
  pools.forEach(async pool => {
    const poolData = await dataProvider.read.getReserveData([pool.address]);
    const tokenPrice = await fetchPrice({ oracle: 'tokens', id: pool.oracleId });

    supplyAprs[pool.address.toLowerCase()] = new BigNumber(poolData[3].toString()).dividedBy(
      RAY_DECIMALS
    );
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
  const rewardInUsdPerSecond: BigNumber[] = [];
  const incentivesControllerContract = fetchContract(lendleChef, LendleChefAbi, MANTLE_CHAIN_ID);
  const poolInfoCalls = (pools as any[]).map(pool => {
    return incentivesControllerContract.read.poolInfo([pool.aToken]);
  });
  const [poolInfo, rewardsPerSecond, totalAllocPoint] = await Promise.all([
    Promise.all(poolInfoCalls),
    incentivesControllerContract.read.rewardsPerSecond().then(res => new BigNumber(res.toString())),
    incentivesControllerContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);
  const allocPoints = poolInfo.map(res => new BigNumber(res[1].toString()));
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardId });

  allocPoints.forEach(allocPoint => {
    rewardInUsdPerSecond.push(
      allocPoint
        .times(rewardsPerSecond)
        .dividedBy(totalAllocPoint)
        .dividedBy(rewardDecimals)
        .times(rewardPrice)
        .times(burn)
    );
  });

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
        lsApr = (lsApr * lsAprFactor) / 100;
        liquidStakingAprs.push(lsApr);
      } catch {
        console.error(`Failed to fetch ${pools[i].name} liquid staking APR from ${pools[i].lsUrl}`);
      }
    } else {
      liquidStakingAprs.push(0);
    }
  }
  return liquidStakingAprs;
};

module.exports = getLendleApys;
