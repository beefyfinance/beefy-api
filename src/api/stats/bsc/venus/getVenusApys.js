const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const IUnitroller = require('../../../../abis/IUnitroller.json');
const VToken = require('../../../../abis/VToken.json');
const pools = require('../../../../data/venusPools.json');
const { BASE_HPY } = require('../../../../constants');

const UNITROLLER = '0xfD36E2c2a6789Db23113685031d7F16329158384';
const BLOCKS_PER_YEAR = 10512000;

const getVenusApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  apys['venus-wbnb'] = apys['venus-bnb'];

  return apys;
};

const getPoolApy = async pool => {
  const [{ supplyBase, supplyVxs }, { borrowBase, borrowVxs }] = await Promise.all([
    getSupplyApys(pool),
    getBorrowApys(pool),
  ]);

  const {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  } = getLeveragedApys(supplyBase, borrowBase, supplyVxs, borrowVxs, 4, 0.58);

  const totalVxs = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const compoundedVxs = compound(totalVxs, BASE_HPY, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  return { [pool.name]: apy };
};

const getSupplyApys = async pool => {
  const vtokenContract = new web3.eth.Contract(VToken, pool.vtoken);
  const unitrollerContract = new web3.eth.Contract(IUnitroller, UNITROLLER);

  let [
    venusPrice,
    tokenPrice,
    supplyRate,
    venusRate,
    totalSupply,
    exchangeRateStored,
  ] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'XVS' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    vtokenContract.methods.supplyRatePerBlock().call(),
    unitrollerContract.methods.venusSpeeds(pool.vtoken).call(),
    vtokenContract.methods.totalSupply().call(),
    vtokenContract.methods.exchangeRateStored().call(),
  ]);

  supplyRate = new BigNumber(supplyRate);
  venusRate = new BigNumber(venusRate);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

  const supplyApyPerYear = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const venusPerYear = venusRate.times(BLOCKS_PER_YEAR);
  const venusPerYearInUsd = venusPerYear.div('1e18').times(venusPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: venusPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async pool => {
  const unitrollerContract = new web3.eth.Contract(IUnitroller, UNITROLLER);
  const vtokenContract = new web3.eth.Contract(VToken, pool.vtoken);

  let [venusPrice, bnbPrice, borrowRate, venusRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'XVS' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    vtokenContract.methods.borrowRatePerBlock().call(),
    unitrollerContract.methods.venusSpeeds(pool.vtoken).call(),
    vtokenContract.methods.totalBorrows().call(),
  ]);

  borrowRate = new BigNumber(borrowRate);
  venusRate = new BigNumber(venusRate);
  totalBorrows = new BigNumber(totalBorrows);

  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');

  const venusPerYear = venusRate.times(BLOCKS_PER_YEAR);
  const venusPerYearInUsd = venusPerYear.div('1e18').times(venusPrice);

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(bnbPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowVxs: venusPerYearInUsd.div(totalBorrowsInUsd),
  };
};

const getLeveragedApys = (supplyBase, borrowBase, supplyVxs, borrowVxs, depth, borrowPercent) => {
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
      supplyVxs.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  for (let i = 0; i < depth; i++) {
    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedBorrowVxs = leveragedBorrowVxs.plus(
      borrowVxs.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  };
};

module.exports = getVenusApys;
