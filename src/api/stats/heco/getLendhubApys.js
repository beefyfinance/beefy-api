const BigNumber = require('bignumber.js');
const { hecoWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const Comptroller = require('../../../abis/heco/Comptroller.json');
const IToken = require('../../../abis/VToken.json');
const pools = require('../../../data/heco/lendhubPools.json');
const { BASE_HPY } = require('../../../constants');

const COMPTROLLER = '0x6537d6307ca40231939985bcf7d83096dd1b4c09';
const BLOCKS_PER_YEAR = 10512000;

const getLendhubApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  // apys['lendhub-wht'] = apys['lendhub-ht'];

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
  } = getLeveragedApys(
    supplyBase,
    borrowBase,
    supplyVxs,
    borrowVxs,
    pool.borrowDepth,
    pool.borrowPercent
  );

  const totalVxs = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const compoundedVxs = compound(totalVxs, BASE_HPY, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  return { [pool.name]: apy };
};

const getSupplyApys = async pool => {
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);
  const comptrollerContract = new web3.eth.Contract(Comptroller, COMPTROLLER);

  let [
    lhbPrice,
    tokenPrice,
    supplyRate,
    compRate,
    totalSupply,
    exchangeRateStored,
  ] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'LHB' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    itokenContract.methods.supplyRatePerBlock().call(),
    comptrollerContract.methods.compSpeeds(pool.itoken).call(),
    itokenContract.methods.totalSupply().call(),
    itokenContract.methods.exchangeRateStored().call(),
  ]);

  supplyRate = new BigNumber(supplyRate);
  compRate = new BigNumber(compRate);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

  const supplyApyPerYear = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const compPerYear = compRate.times(BLOCKS_PER_YEAR);
  const compPerYearInUsd = compPerYear.div('1e18').times(lhbPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: compPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async pool => {
  const comptrollerContract = new web3.eth.Contract(Comptroller, COMPTROLLER);
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);

  let [lhbPrice, tokenPrice, borrowRate, compRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'LHB' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    itokenContract.methods.borrowRatePerBlock().call(),
    comptrollerContract.methods.compSpeeds(pool.itoken).call(),
    itokenContract.methods.totalBorrows().call(),
  ]);

  borrowRate = new BigNumber(borrowRate);
  compRate = new BigNumber(compRate);
  totalBorrows = new BigNumber(totalBorrows);

  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');

  const compPerYear = compRate.times(BLOCKS_PER_YEAR);
  const compPerYearInUsd = compPerYear.div('1e18').times(lhbPrice);

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(tokenPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowVxs: compPerYearInUsd.div(totalBorrowsInUsd),
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

module.exports = getLendhubApys;
