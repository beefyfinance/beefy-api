const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BASE_HPY } = require('../../../../constants');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const IncentivesController = require('../../../../abis/fantom/GeistIncentivesController.json');
const IAaveProtocolDataProvider = require('../../../../abis/matic/AaveProtocolDataProvider.json');
const pools = require('../../../../data/valasPools.json');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const AaveProtocolDataProvider = '0xb5f344F568b714c471B23924644B4e393Ca4E9E9';
const incentivesController = '0xB7c1d99069a4eb582Fc04E7e1124794000e7ecBF';
const secondsPerYear = 31536000;

const RAY_DECIMALS = '1e27';
const ORACLE = 'tokens';
const ORACLE_ID = 'VALAS';
const DECIMALS = '1e18';

const getValasLendingApys = async () => {
  let apys = {};

  const allPools = [];
  pools.forEach(pool => {
    allPools.push(pool);
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
  const incentivesContract = getContractWithProvider(
    IncentivesController,
    incentivesController,
    web3
  );
  const [rewardsPerSecond, totalAllocPoint] = await Promise.all([
    incentivesContract.methods.rewardsPerSecond().call(),
    incentivesContract.methods.totalAllocPoint().call(),
  ]);
  return { rewardsPerSecond, totalAllocPoint };
};

const getPoolApy = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const { supplyBase, supplyReward, borrowBase, borrowReward } = await getPoolData(
    pool,
    rewardsPerSecond,
    totalAllocPoint
  );

  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyReward, leveragedBorrowReward } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyReward,
      borrowReward,
      pool.borrowDepth,
      pool.borrowPercent
    );

  let totalReward = leveragedSupplyReward.plus(leveragedBorrowReward);
  let compoundedReward = compound(totalReward, BASE_HPY, 1, 0.955);
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedReward).toNumber();
  // console.log(pool.name,apy,supplyBase.valueOf(),borrowBase.valueOf(),supplyReward.valueOf(),borrowReward.valueOf());
  return { [pool.name]: apy };
};

const getPoolData = async (pool, rewardsPerSecond, totalAllocPoint) => {
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

  const { supplyRewardInUsd, borrowRewardInUsd } = await getRewardPerYear(
    pool,
    rewardsPerSecond,
    totalAllocPoint
  );
  const supplyReward = supplyRewardInUsd.div(totalSupplyInUsd);
  const borrowReward = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : borrowRewardInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyReward, borrowBase, borrowReward };
};

const getRewardPerYear = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const incentivesContract = getContractWithProvider(
    IncentivesController,
    incentivesController,
    web3
  );

  const [{ allocPoint: aTokenAlloc }, { allocPoint: debtTokenAlloc }] = await Promise.all([
    incentivesContract.methods.poolInfo(pool.aToken).call(),
    incentivesContract.methods.poolInfo(pool.debtToken).call(),
  ]);

  const supplyRewardRate = new BigNumber(aTokenAlloc)
    .times(rewardsPerSecond)
    .dividedBy(totalAllocPoint);
  const borrowRewardRate = new BigNumber(debtTokenAlloc)
    .times(rewardsPerSecond)
    .dividedBy(totalAllocPoint);

  const price = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });
  const supplyRewardInUsd = supplyRewardRate
    .times(secondsPerYear)
    .div(DECIMALS)
    .times(price)
    .dividedBy(4); // 25%
  const borrowRewardInUsd = borrowRewardRate
    .times(secondsPerYear)
    .div(DECIMALS)
    .times(price)
    .dividedBy(4); // 25%

  return { supplyRewardInUsd, borrowRewardInUsd };
};

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyReward,
  borrowReward,
  depth,
  borrowPercent
) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyReward = new BigNumber(0);
  let leveragedBorrowReward = new BigNumber(0);

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(i))
    );
    leveragedSupplyReward = leveragedSupplyReward.plus(
      supplyReward.times(borrowPercent.exponentiatedBy(i))
    );

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(i + 1))
    );
    leveragedBorrowReward = leveragedBorrowReward.plus(
      borrowReward.times(borrowPercent.exponentiatedBy(i + 1))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyReward,
    leveragedBorrowReward,
  };
};

module.exports = getValasLendingApys;
