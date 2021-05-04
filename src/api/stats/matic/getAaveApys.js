const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const IAaveDistributionManager = require('../../../abis/matic/AaveDistributionManager.json');
const IAaveProtocolDataProvider = require('../../../abis/matic/AaveProtocolDataProvider.json');
const pools = require('../../../data/matic/aavePools.json');
const { BASE_HPY } = require('../../../constants');

const AaveProtocolDataProvider = '0x7551b5D2763519d4e37e8B81929D336De671d46d';
const AaveDistributionManager = '0x357D51124f59836DeD84c8a1730D72B749d8BC23';
const secondsPerYear = 31536000;

const RAY_DECIMALS = '1e27';

const getAaveApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const { supplyBase, supplyMatic, borrowBase, borrowMatic } = await getPoolData(pool);

  const {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  } = getLeveragedApys(
    supplyBase,
    borrowBase,
    supplyMatic,
    borrowMatic,
    pool.borrowDepth,
    pool.borrowPercent
  );

  const totalVxs = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const compoundedVxs = compound(totalVxs, BASE_HPY, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyMatic.valueOf(), borrowMatic.valueOf());
  return { [pool.name]: apy };
};

const getPoolData = async pool => {
  const dataProvider = new web3.eth.Contract(IAaveProtocolDataProvider, AaveProtocolDataProvider);
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

  const { supplyMaticInUsd, borrowMaticInUsd } = await getMaticPerYear(pool);
  const supplyMatic = supplyMaticInUsd.div(totalSupplyInUsd);
  const borrowMatic = borrowMaticInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyMatic, borrowBase, borrowMatic };
};

const getMaticPerYear = async pool => {
  const distribution = new web3.eth.Contract(IAaveDistributionManager, AaveDistributionManager);

  let res = await distribution.methods.assets(pool.aToken).call();
  const supplyMaticRate = new BigNumber(res.emissionPerSecond);
  res = await distribution.methods.assets(pool.debtToken).call();
  const borrowMaticRate = new BigNumber(res.emissionPerSecond);

  const maticPrice = await fetchPrice({ oracle: 'tokens', id: 'WMATIC' });
  const supplyMaticInUsd = supplyMaticRate.times(secondsPerYear).div('1e18').times(maticPrice);
  const borrowMaticInUsd = borrowMaticRate.times(secondsPerYear).div('1e18').times(maticPrice);

  return { supplyMaticInUsd, borrowMaticInUsd };
};

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyMatic,
  borrowMatic,
  depth,
  borrowPercent
) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyVxs = new BigNumber(0);
  let leveragedBorrowVxs = new BigNumber(0);

  for (let i = 0; i <= depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedSupplyVxs = leveragedSupplyVxs.plus(
      supplyMatic.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  for (let i = 0; i < depth; i++) {
    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedBorrowVxs = leveragedBorrowVxs.plus(
      borrowMatic.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  };
};

module.exports = getAaveApys;
