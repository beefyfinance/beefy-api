const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const fetch = require('node-fetch');
const { getApyBreakdown } = require('../getApyBreakdown');
const { default: IAaveV3Incentives } = require('../../../../abis/AaveV3Incentives');
const { default: IAaveV3PoolDataProvider } = require('../../../../abis/AaveV3PoolDataProvider');
const { fetchContract } = require('../../../rpc/client');

const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';

// config = { dataProvider: address, incentives: address, rewards: []}
const getAaveV3ApyData = async (config, pools, chainId) => {
  const apys = [];
  const lsApys = [];

  const allPools = [];
  pools.forEach(pool => {
    allPools.push(pool);
    // const newPool = { ...pool };
    // const newPool8 = { ...pool };
    // newPool.name = pool.name + '-delev';
    // newPool.borrowDepth = 0;
    // newPool8.name = pool.name + '-8';
    // newPool8.borrowDepth = 8;
    // allPools.push(newPool8);
    // allPools.push(newPool);
  });

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(config, pool, chainId)));
  const values = await Promise.all(promises);

  values.forEach(item => {
    apys.push(item[0]);
    lsApys.push(item[1]);
  });

  return getApyBreakdown(pools, null, apys, 0, lsApys);
};

const getPoolApy = async (config, pool, chainId) => {
  const { supplyBase, supplyNative, borrowBase, borrowNative } = await getAaveV3PoolData(
    config,
    pool,
    chainId
  );
  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyNative, leveragedBorrowNative } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyNative,
      borrowNative,
      pool.borrowDepth,
      pool.borrowPercent
    );

  let totalNative = leveragedSupplyNative.plus(leveragedBorrowNative);
  let shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  let compoundedNative = compound(totalNative, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedNative);
  let lsApy = 0;
  if (pool.liquidStakingUrl) {
    const response = await fetch(pool.liquidStakingUrl).then(res => res.json());
    lsApy = pool.lido ? response.apr : response.value;
    lsApy = lsApy / 100;
  }
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyNative.valueOf(), borrowNative.valueOf());
  return [apy, lsApy];
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
  const borrowNative = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : borrowNativeInUsd.div(totalBorrowInUsd);

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
    const borrowNativeRate = new BigNumber(debtTokenRewardsDataResults[1]);

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

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyNative,
  borrowNative,
  depth,
  borrowPercent
) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyNative = new BigNumber(0);
  let leveragedBorrowNative = new BigNumber(0);

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(i))
    );
    leveragedSupplyNative = leveragedSupplyNative.plus(
      supplyNative.times(borrowPercent.exponentiatedBy(i))
    );

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(i + 1))
    );
    leveragedBorrowNative = leveragedBorrowNative.plus(
      borrowNative.times(borrowPercent.exponentiatedBy(i + 1))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyNative,
    leveragedBorrowNative,
  };
};

module.exports = { getAaveV3ApyData, getAaveV3PoolData };
