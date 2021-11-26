const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const Comptroller = require('../../../abis/heco/Comptroller.json');
const IToken = require('../../../abis/VToken.json');
const pools = require('../../../data/fantom/screamPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
const { BASE_HPY, FANTOM_CHAIN_ID: chainId } = require('../../../constants');

const COMPTROLLER = '0x260E596DAbE3AFc463e75B6CC05d8c46aCAcFB09';

const getScreamApys = async () => {
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
  const secondsPerBlock = await Promise.all([getBlockTime(chainId)]);
  const BLOCKS_PER_YEAR = 31536000 / secondsPerBlock;

  const [{ supplyBase, supplyVxs }, { borrowBase, borrowVxs }] = await Promise.all([
    getSupplyApys(pool, BLOCKS_PER_YEAR),
    getBorrowApys(pool, BLOCKS_PER_YEAR),
  ]);

  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyVxs, leveragedBorrowVxs } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyVxs,
      borrowVxs,
      pool.borrowDepth,
      pool.borrowPercent
    );

  const totalVxs = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const compoundedVxs = compound(totalVxs, BASE_HPY, 1, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  return { [pool.name]: apy };
};

const getSupplyApys = async (pool, BLOCKS_PER_YEAR) => {
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);
  const comptrollerContract = new web3.eth.Contract(Comptroller, COMPTROLLER);

  let [screamPrice, tokenPrice, supplyRate, compRate, totalSupply, exchangeRateStored] =
    await Promise.all([
      fetchPrice({ oracle: 'tokens', id: 'SCREAM' }),
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
  const compPerYearInUsd = compPerYear.div('1e18').times(screamPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: compPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (pool, BLOCKS_PER_YEAR) => {
  const comptrollerContract = new web3.eth.Contract(Comptroller, COMPTROLLER);
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);

  let [screamPrice, tokenPrice, borrowRate, compRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'SCREAM' }),
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
  const compPerYearInUsd = compPerYear.div('1e18').times(screamPrice);

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

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(i + i))
    );
    leveragedSupplyVxs = leveragedSupplyVxs.plus(
      supplyVxs.times(borrowPercent.exponentiatedBy(i + i))
    );

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(i))
    );
    leveragedBorrowVxs = leveragedBorrowVxs.plus(borrowVxs.times(borrowPercent.exponentiatedBy(i)));
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  };
};

module.exports = getScreamApys;

let supplyBase = 0.028;
let leveragedSupplyBase = 0;
let borrowPercent = 0.75;
let depth = 4;
for (let i = 0; i <= depth; i++) {
  leveragedSupplyBase = leveragedSupplyBase.plus(
    supplyBase.times(borrowPercent.exponentiatedBy(depth - i))
  );
  console.log(leveragedSupplyBase);
}
