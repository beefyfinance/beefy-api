const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const IncentivesController = require('../../../abis/fantom/GeistIncentivesController.json');
const IAaveProtocolDataProvider = require('../../../abis/matic/AaveProtocolDataProvider.json');
const pools = require('../../../data/fantom/geistPools.json');
const { BASE_HPY } = require('../../../constants');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const AaveProtocolDataProvider = '0xf3B0611e2E4D2cd6aB4bb3e01aDe211c3f42A8C3';
const incentivesController = '0x297FddC5c33Ef988dd03bd13e162aE084ea1fE57';
const secondsPerYear = 31536000;

const RAY_DECIMALS = '1e27';

const getGeistLendingApys = async () => {
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

  const { rewardsPerSecond, totalAllocPoint } = await getIncentiveControllerData();

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(pool, rewardsPerSecond, totalAllocPoint)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getIncentiveControllerData = async () => {
  const incentivesControllerContract = getContractWithProvider(
    IncentivesController,
    incentivesController,
    web3
  );
  const rewardsPerSecond = await incentivesControllerContract.methods.rewardsPerSecond().call();
  const totalAllocPoint = await incentivesControllerContract.methods.totalAllocPoint().call();
  return { rewardsPerSecond, totalAllocPoint };
};

const getPoolApy = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const { supplyBase, supplyGeist, borrowBase, borrowGeist } = await getGeistPoolData(
    pool,
    rewardsPerSecond,
    totalAllocPoint
  );

  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyGeist, leveragedBorrowGeist } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyGeist,
      borrowGeist,
      pool.borrowDepth,
      pool.borrowPercent
    );

  let totalGeist = leveragedSupplyGeist.plus(leveragedBorrowGeist);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  let compoundedGeist = compound(totalGeist, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedGeist).toNumber();
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyGeist.valueOf(), borrowGeist.valueOf());
  return { [pool.name]: apy };
};

const getGeistPoolData = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const dataProvider = getContractWithProvider(
    IAaveProtocolDataProvider,
    AaveProtocolDataProvider,
    web3
  );
  const {
    availableLiquidity,
    totalStableDebt,
    totalVariableDebt,
    liquidityRate,
    variableBorrowRate,
  } = await dataProvider.methods.getReserveData(pool.token).call();

  const supplyBase = new BigNumber(liquidityRate).div(RAY_DECIMALS);
  const borrowBase = new BigNumber(variableBorrowRate).div(RAY_DECIMALS);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalBorrowInUsd = new BigNumber(totalVariableDebt).div(pool.decimals).times(tokenPrice);
  const totalSupplyInUsd = new BigNumber(availableLiquidity)
    .plus(new BigNumber(totalStableDebt))
    .plus(new BigNumber(totalVariableDebt))
    .div(pool.decimals)
    .times(tokenPrice);

  const { supplyGeistInUsd, borrowGeistInUsd } = await getGeistPerYear(
    pool,
    rewardsPerSecond,
    totalAllocPoint
  );
  const supplyGeist = supplyGeistInUsd.div(totalSupplyInUsd);
  const borrowGeist = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : borrowGeistInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyGeist, borrowBase, borrowGeist };
};

const getGeistPerYear = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const incentivesControllerContract = getContractWithProvider(
    IncentivesController,
    incentivesController,
    web3
  );

  let res = await incentivesControllerContract.methods.poolInfo(pool.aToken).call();
  const supplyGeistRate = new BigNumber(res.allocPoint)
    .times(rewardsPerSecond)
    .dividedBy(totalAllocPoint);
  res = await incentivesControllerContract.methods.poolInfo(pool.debtToken).call();
  const borrowGeistRate = new BigNumber(res.allocPoint)
    .times(rewardsPerSecond)
    .dividedBy(totalAllocPoint);

  const GeistPrice = await fetchPrice({ oracle: 'tokens', id: 'GEIST' });
  const supplyGeistInUsd = supplyGeistRate
    .times(secondsPerYear)
    .div('1e18')
    .times(GeistPrice)
    .dividedBy(2);
  const borrowGeistInUsd = borrowGeistRate
    .times(secondsPerYear)
    .div('1e18')
    .times(GeistPrice)
    .dividedBy(2);

  return { supplyGeistInUsd, borrowGeistInUsd };
};

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyGeist,
  borrowGeist,
  depth,
  borrowPercent
) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyGeist = new BigNumber(0);
  let leveragedBorrowGeist = new BigNumber(0);

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(i))
    );
    leveragedSupplyGeist = leveragedSupplyGeist.plus(
      supplyGeist.times(borrowPercent.exponentiatedBy(i))
    );

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(i + 1))
    );
    leveragedBorrowGeist = leveragedBorrowGeist.plus(
      borrowGeist.times(borrowPercent.exponentiatedBy(i + 1))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyGeist,
    leveragedBorrowGeist,
  };
};

module.exports = getGeistLendingApys;
