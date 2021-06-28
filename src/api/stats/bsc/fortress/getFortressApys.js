const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const IUnitroller = require('../../../../abis/FotressUnitroller.json');
const VToken = require('../../../../abis/VToken.json');
const pools = require('../../../../data/fortressPools.json');
const { BASE_HPY } = require('../../../../constants');

const UNITROLLER = '0x67340Bd16ee5649A37015138B3393Eb5ad17c195';
const BLOCKS_PER_YEAR = 10512000;

const getFortressApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [{ supplyBase, supplyFts }, { borrowBase, borrowFts }] = await Promise.all([
    getSupplyApys(pool),
    getBorrowApys(pool),
  ]);

  const {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyFts,
    leveragedBorrowFts,
  } = getLeveragedApys(supplyBase, borrowBase, supplyFts, borrowFts, 4, 0.58);

  const totalFts = leveragedSupplyFts.plus(leveragedBorrowFts);
  const compoundedFts = compound(totalFts, BASE_HPY, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedFts).toNumber();

  // console.log(pool.name, 'base', supplyBase.valueOf(), supplyFts.valueOf(), borrowBase.valueOf(), borrowFts.valueOf());
  // console.log(pool.name, leveragedSupplyBase.valueOf(), leveragedBorrowBase.valueOf(), totalFts.valueOf());

  return { [pool.name]: apy };
};

const getSupplyApys = async pool => {
  const vtokenContract = new web3.eth.Contract(VToken, pool.vtoken);
  const unitrollerContract = new web3.eth.Contract(IUnitroller, UNITROLLER);

  let [
    fortressPrice,
    tokenPrice,
    supplyRate,
    fortressRate,
    totalSupply,
    exchangeRateStored,
  ] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'FTS' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    vtokenContract.methods.supplyRatePerBlock().call(),
    unitrollerContract.methods.fortressSpeeds(pool.vtoken).call(),
    vtokenContract.methods.totalSupply().call(),
    vtokenContract.methods.exchangeRateStored().call(),
  ]);

  supplyRate = new BigNumber(supplyRate);
  fortressRate = new BigNumber(fortressRate);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

  const supplyApyPerYear = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const fortressPerYear = fortressRate.times(BLOCKS_PER_YEAR);
  const fortressPerYearInUsd = fortressPerYear.div('1e18').times(fortressPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyFts: fortressPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async pool => {
  const unitrollerContract = new web3.eth.Contract(IUnitroller, UNITROLLER);
  const vtokenContract = new web3.eth.Contract(VToken, pool.vtoken);

  let [fortressPrice, bnbPrice, borrowRate, fortressRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'FTS' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    vtokenContract.methods.borrowRatePerBlock().call(),
    unitrollerContract.methods.fortressSpeeds(pool.vtoken).call(),
    vtokenContract.methods.totalBorrows().call(),
  ]);

  borrowRate = new BigNumber(borrowRate);
  fortressRate = new BigNumber(fortressRate);
  totalBorrows = new BigNumber(totalBorrows);

  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');

  const fortressPerYear = fortressRate.times(BLOCKS_PER_YEAR);
  const fortressPerYearInUsd = fortressPerYear.div('1e18').times(fortressPrice);

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(bnbPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowFts: fortressPerYearInUsd.div(totalBorrowsInUsd),
  };
};

const getLeveragedApys = (supplyBase, borrowBase, supplyFts, borrowFts, depth, borrowPercent) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyFts = new BigNumber(0);
  let leveragedBorrowFts = new BigNumber(0);

  for (let i = 0; i <= depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedSupplyFts = leveragedSupplyFts.plus(
      supplyFts.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  for (let i = 0; i < depth; i++) {
    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedBorrowFts = leveragedBorrowFts.plus(
      borrowFts.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyFts,
    leveragedBorrowFts,
  };
};

module.exports = getFortressApys;
