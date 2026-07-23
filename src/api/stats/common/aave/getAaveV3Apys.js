import { BigNumber } from 'bignumber.js';
import jp from 'jsonpath';
import { default as IAaveV3Incentives } from '../../../../abis/AaveV3Incentives.ts';
import { default as IAaveV3PoolDataProvider } from '../../../../abis/AaveV3PoolDataProvider.ts';
import { fetchPrice } from '../../../../utils/fetchPrice.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { getMerklOpportunitiesByProtocol } from '../../../offchain-rewards/providers/merkl/proxyClient.ts';
import { fetchContract } from '../../../rpc/client.ts';
import { getApyBreakdown } from '../getApyBreakdownNew.ts';

const logger = getLoggerFor({ module: 'apy', platform: 'aave' });

const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';

// config = { dataProvider: address, incentives: address, rewards: []}
const getAaveV3ApyData = async (config, pools, chainId) => {
  const rewardApys = [];
  const lendingApys = [];
  const lsApys = [];

  const [values, meritApys, merklApys] = await Promise.all([
    Promise.all(pools.map(pool => getPoolApy(config, pool, chainId))),
    getMeritApys(pools),
    getMerklApys(chainId, pools),
  ]);

  values.forEach((item, i) => {
    rewardApys.push(item[0].plus(meritApys[i]).plus(merklApys[i]));
    lendingApys.push(item[1]);
    lsApys.push(item[2]);
  });

  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name,
      lending: lendingApys[i],
      vault: rewardApys[i],
      liquidStaking: lsApys[i],
    }))
  );
};

async function getMeritApys(pools) {
  let meritData = {};
  if (pools.some(p => p.merit)) {
    try {
      const res = await fetch('https://apps.aavechan.com/api/merit/aprs').then(res => res.json());
      meritData = res.currentAPR.actionsAPR;
    } catch (e) {
      logger.warn({ err: e }, 'merit apys fetch failed');
    }
  }
  return pools.map(p => new BigNumber(meritData[p.merit] || 0).div(100));
}

async function getMerklApys(chainId, pools) {
  let merklData = {};
  if (pools.some(p => p.identifier)) {
    try {
      const opportunities = await getMerklOpportunitiesByProtocol(chainId, 'aave');
      merklData = opportunities.reduce((acc, opportunity) => {
        acc[opportunity.identifier] = opportunity.apr;
        return acc;
      }, {});
    } catch (e) {
      logger.warn({ err: e, chain: chainId }, 'merkl apys fetch failed');
    }
  }
  return pools.map(p => new BigNumber(merklData[p.identifier] || 0).div(100));
}

const getPoolApy = async (config, pool, chainId) => {
  const { supplyBase, supplyNative, borrowBase, borrowNative } = await getAaveV3PoolData(config, pool, chainId);
  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyNative, leveragedBorrowNative } = getLeveragedApys(
    supplyBase,
    borrowBase,
    supplyNative,
    borrowNative,
    pool.borrowDepth,
    pool.borrowPercent
  );

  const rewardsApy = leveragedSupplyNative.plus(leveragedBorrowNative);
  let lendingApy = leveragedSupplyBase.minus(leveragedBorrowBase);
  let lsApy = 0;
  if (pool.lsUrl) {
    const response = await fetch(pool.lsUrl).then(res => res.json());
    lsApy = jp.query(response, pool.dataPath)[0];
    let lsAprFactor = 1;
    if (pool.lsAprFactor) lsAprFactor = pool.lsAprFactor;
    lsApy = (lsApy * lsAprFactor) / 100;
  }
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyNative.valueOf(), borrowNative.valueOf());
  return [rewardsApy, lendingApy, lsApy];
};

const getAaveV3PoolData = async (config, pool, chainId) => {
  const dataProvider = fetchContract(config.dataProvider, IAaveV3PoolDataProvider, chainId);

  const [reserveData, { supplyNativeInUsd, borrowNativeInUsd }] = await Promise.all([
    dataProvider.read.getReserveData([pool.token]),
    getRewardsPerYear(config, pool, chainId),
  ]);

  const totalAToken = new BigNumber(reserveData[2].toString());
  const totalVariableDebt = new BigNumber(reserveData[4].toString());
  const liquidityRate = new BigNumber(reserveData[5].toString());
  const variableBorrowRate = new BigNumber(reserveData[6].toString());

  const supplyBase = new BigNumber(liquidityRate).div(RAY_DECIMALS);
  const borrowBase = new BigNumber(variableBorrowRate).div(RAY_DECIMALS);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalSupplyInUsd = new BigNumber(totalAToken).div(pool.decimals).times(tokenPrice);
  const totalBorrowInUsd = new BigNumber(totalVariableDebt).div(pool.decimals).times(tokenPrice);

  const supplyNative = supplyNativeInUsd.div(totalSupplyInUsd);
  const borrowNative = totalBorrowInUsd.isZero() ? new BigNumber(0) : borrowNativeInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyNative, borrowBase, borrowNative };
};

const getRewardsPerYear = async (config, pool, chainId) => {
  const distribution = fetchContract(config.incentives, IAaveV3Incentives, chainId);

  const aTokenRewardsDataCalls = config.rewards.map(reward =>
    distribution.read.getRewardsData([pool.aToken, reward.token])
  );
  const debtTokenRewardsDataCalls = config.rewards.map(reward =>
    distribution.read.getRewardsData([pool.debtToken, reward.token])
  );

  const [aTokenRewardsDataResults, debtTokenRewardsDataResults] = await Promise.all([
    Promise.all(aTokenRewardsDataCalls),
    Promise.all(debtTokenRewardsDataCalls),
  ]);

  let supplyNativeInUsd = new BigNumber(0);
  let borrowNativeInUsd = new BigNumber(0);
  for (const [index, reward] of Object.entries(config.rewards)) {
    const supplyNativeRate = new BigNumber(aTokenRewardsDataResults[index][1]);
    const distributionEnd = new BigNumber(aTokenRewardsDataResults[index][3]);
    const borrowNativeRate = new BigNumber(debtTokenRewardsDataResults[index][1]);

    const tokenPrice = await fetchPrice({ oracle: reward.oracle, id: reward.oracleId });
    if (distributionEnd.gte(new BigNumber(Date.now() / 1000))) {
      supplyNativeInUsd = supplyNativeInUsd.plus(
        supplyNativeRate.times(secondsPerYear).div(reward.decimals).times(tokenPrice)
      );
      borrowNativeInUsd = borrowNativeInUsd.plus(
        borrowNativeRate.times(secondsPerYear).div(reward.decimals).times(tokenPrice)
      );
    } else {
      supplyNativeInUsd = supplyNativeInUsd.plus(new BigNumber(0));
      borrowNativeInUsd = borrowNativeInUsd.plus(new BigNumber(0));
    }
  }

  return { supplyNativeInUsd, borrowNativeInUsd };
};

const getLeveragedApys = (supplyBase, borrowBase, supplyNative, borrowNative, depth, borrowPercent) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyNative = new BigNumber(0);
  let leveragedBorrowNative = new BigNumber(0);

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(supplyBase.times(borrowPercent.exponentiatedBy(i)));
    leveragedSupplyNative = leveragedSupplyNative.plus(supplyNative.times(borrowPercent.exponentiatedBy(i)));

    leveragedBorrowBase = leveragedBorrowBase.plus(borrowBase.times(borrowPercent.exponentiatedBy(i + 1)));
    leveragedBorrowNative = leveragedBorrowNative.plus(borrowNative.times(borrowPercent.exponentiatedBy(i + 1)));
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyNative,
    leveragedBorrowNative,
  };
};

export { getAaveV3ApyData, getAaveV3PoolData };
