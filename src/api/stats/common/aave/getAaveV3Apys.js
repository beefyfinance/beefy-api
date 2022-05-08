const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../../utils/web3');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const IAaveV3Incentives = require('../../../../abis/AaveV3Incentives.json');
const IAaveV3PoolDataProvider = require('../../../../abis/AaveV3PoolDataProvider.json');
const { BASE_HPY } = require('../../../../constants');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const secondsPerYear = 31536000;
const RAY_DECIMALS = '1e27';

// config = { dataProvider: address, incentives: address, rewards: []}
const getAaveV3ApyData = async (config, pools) => {
  let apys = {};

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
  allPools.forEach(pool => promises.push(getPoolApy(config, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (config, pool) => {
  const { supplyBase, supplyNative, borrowBase, borrowNative } = await getAaveV3PoolData(
    config,
    pool
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
  let compoundedNative = compound(totalNative, BASE_HPY, 1, 0.955);
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedNative).toNumber();
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyNative.valueOf(), borrowNative.valueOf());
  return { [pool.name]: apy };
};

const getAaveV3PoolData = async (config, pool) => {
  const dataProvider = getContractWithProvider(IAaveV3PoolDataProvider, config.dataProvider, web3);
  const { totalAToken, totalVariableDebt, liquidityRate, variableBorrowRate } =
    await dataProvider.methods.getReserveData(pool.token).call();

  const supplyBase = new BigNumber(liquidityRate).div(RAY_DECIMALS);
  const borrowBase = new BigNumber(variableBorrowRate).div(RAY_DECIMALS);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalSupplyInUsd = new BigNumber(totalAToken).div(pool.decimals).times(tokenPrice);
  const totalBorrowInUsd = new BigNumber(totalVariableDebt).div(pool.decimals).times(tokenPrice);

  const { supplyNativeInUsd, borrowNativeInUsd } = await getRewardsPerYear(config, pool);
  const supplyNative = supplyNativeInUsd.div(totalSupplyInUsd);
  const borrowNative = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : borrowNativeInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyNative, borrowBase, borrowNative };
};

const getRewardsPerYear = async (config, pool) => {
  const distribution = getContractWithProvider(IAaveV3Incentives, config.incentives, web3);

  let supplyNativeInUsd = new BigNumber(0);
  let borrowNativeInUsd = new BigNumber(0);
  for (let reward of config.rewards) {
    let res = await distribution.methods.getRewardsData(pool.aToken, reward.token).call();
    const supplyNativeRate = new BigNumber(res[1]);
    res = await distribution.methods.getRewardsData(pool.debtToken, reward.token).call();
    const borrowNativeRate = new BigNumber(res[1]);

    const tokenPrice = await fetchPrice({ oracle: reward.oracle, id: reward.oracleId });
    supplyNativeInUsd = supplyNativeRate
      .times(secondsPerYear)
      .div(reward.decimals)
      .times(tokenPrice);
    borrowNativeInUsd = borrowNativeRate
      .times(secondsPerYear)
      .div(reward.decimals)
      .times(tokenPrice);
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
