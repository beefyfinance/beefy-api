const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const pools = require('../../../data/avax/aavePools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const {
  default: IAaveProtocolDataProvider,
} = require('../../../abis/matic/AaveProtocolDataProvider');
const { fetchContract } = require('../../rpc/client');
const {
  default: IAaveDistributionManager,
} = require('../../../abis/matic/AaveDistributionManager');

const AaveProtocolDataProvider = '0x65285E9dfab318f57051ab2b139ccCf232945451';
const AaveDistributionManager = '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9';
const secondsPerYear = 31536000;

const RAY_DECIMALS = '1e27';

const getAaveApys = async () => {
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
  allPools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const { supplyBase, supplyNative, borrowBase, borrowNative } = await getAavePoolData(pool);

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
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedNative).toNumber();
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyNative.valueOf(), borrowNative.valueOf());
  return { [pool.name]: apy };
};

const getAavePoolData = async pool => {
  const dataProvider = fetchContract(
    AaveProtocolDataProvider,
    IAaveProtocolDataProvider,
    AVAX_CHAIN_ID
  );
  const [
    [
      availableLiquidity,
      totalStableDebt,
      totalVariableDebt,
      liquidityRate,
      variableBorrowRate,
      ...otherData
    ],
    { supplyNativeInUsd, borrowNativeInUsd },
  ] = await Promise.all([
    dataProvider.read
      .getReserveData([pool.token])
      .then(v => v.map(m => new BigNumber(m.toString()))),
    getNativePerYear(pool),
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

  const supplyNative = supplyNativeInUsd.div(totalSupplyInUsd);
  const borrowNative = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : borrowNativeInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyNative, borrowBase, borrowNative };
};

const getNativePerYear = async pool => {
  const distribution = fetchContract(
    AaveDistributionManager,
    IAaveDistributionManager,
    AVAX_CHAIN_ID
  );

  const [supplyNativeRate, borrowNativeRate] = await Promise.all([
    distribution.read.assets([pool.aToken]).then(v => new BigNumber(v[0].toString())),
    distribution.read.assets([pool.debtToken]).then(v => new BigNumber(v[0].toString())),
  ]);

  const nativePrice = await fetchPrice({ oracle: 'tokens', id: 'AVAX' });
  const supplyNativeInUsd = supplyNativeRate.times(secondsPerYear).div('1e18').times(nativePrice);
  const borrowNativeInUsd = borrowNativeRate.times(secondsPerYear).div('1e18').times(nativePrice);

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

module.exports = { getAaveApys, getAavePoolData };
