const BigNumber = require('bignumber.js');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');

import { fetchPrice } from '../../../../utils/fetchPrice';
const { compound } = require('../../../../utils/compound');
const pools = require('../../../../data/valasPools.json');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const {
  default: IAaveProtocolDataProvider,
} = require('../../../../abis/matic/AaveProtocolDataProvider');
const {
  default: GeistIncentivesController,
} = require('../../../../abis/fantom/GeistIncentivesController');
const { fetchContract } = require('../../../rpc/client');

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
  const incentivesContract = fetchContract(
    incentivesController,
    GeistIncentivesController,
    BSC_CHAIN_ID
  );
  const [rewardsPerSecond, totalAllocPoint] = await Promise.all([
    incentivesContract.read.rewardsPerSecond().then(res => new BigNumber(res.toString())),
    incentivesContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
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
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  let compoundedReward = compound(totalReward, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedReward).toNumber();
  // console.log(pool.name,apy,supplyBase.valueOf(),borrowBase.valueOf(),supplyReward.valueOf(),borrowReward.valueOf());
  return { [pool.name]: apy };
};

const getPoolData = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const dataProvider = fetchContract(
    AaveProtocolDataProvider,
    IAaveProtocolDataProvider,
    BSC_CHAIN_ID
  );
  const [
    [
      availableLiquidity,
      totalStableDebt,
      totalVariableDebt,
      liquidityRate,
      variableBorrowRate,
      ...rest
    ],
    { supplyRewardInUsd, borrowRewardInUsd },
  ] = await Promise.all([
    dataProvider.read.getReserveData([pool.token]),
    getRewardPerYear(pool, rewardsPerSecond, totalAllocPoint),
  ]);

  const supplyBase = new BigNumber(liquidityRate).div(RAY_DECIMALS);
  const borrowBase = new BigNumber(variableBorrowRate).div(RAY_DECIMALS);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalBorrowInUsd = new BigNumber(totalVariableDebt).div(pool.decimals).times(tokenPrice);
  const totalSupplyInUsd = new BigNumber(availableLiquidity)
    .plus(new BigNumber(totalStableDebt))
    .plus(new BigNumber(totalVariableDebt))
    .div(pool.decimals)
    .times(tokenPrice);

  const supplyReward = supplyRewardInUsd.div(totalSupplyInUsd);
  const borrowReward = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : borrowRewardInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyReward, borrowBase, borrowReward };
};

const getRewardPerYear = async (pool, rewardsPerSecond, totalAllocPoint) => {
  const incentivesContract = fetchContract(
    incentivesController,
    GeistIncentivesController,
    BSC_CHAIN_ID
  );

  const [aTokenAlloc, debtTokenAlloc] = await Promise.all([
    incentivesContract.read.poolInfo([pool.aToken]).then(res => new BigNumber(res[1].toString())),
    incentivesContract.read
      .poolInfo([pool.debtToken])
      .then(res => new BigNumber(res[1].toString())),
  ]);

  const supplyRewardRate = aTokenAlloc.times(rewardsPerSecond).dividedBy(totalAllocPoint);
  const borrowRewardRate = debtTokenAlloc.times(rewardsPerSecond).dividedBy(totalAllocPoint);

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
