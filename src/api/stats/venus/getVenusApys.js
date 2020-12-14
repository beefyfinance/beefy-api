const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const { getPrice } = require('../../../utils/getPrice');
const { compound } = require('../../../utils/compound');
const IUnitroller = require('../../../abis/IUnitroller.json');
const VToken = require('../../../abis/VToken.json');
const pools = require('../../../data/venusPools.json');

const UNITROLLER = '0xfD36E2c2a6789Db23113685031d7F16329158384';
const BLOCKS_PER_YEAR = 10512000;

const web3 = new Web3(process.env.BSC_RPC);

const getVenusApys = async () => {
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
  const { supplyBase, supplyVxs } = await getSupplyApys(pool);
  const { borrowBase, borrowVxs } = await getBorrowApys(pool);

  const {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
  } = getLeveragedApys(supplyBase, borrowBase, supplyVxs, borrowVxs, 3, 0.54);

  const totalVxs = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const compoundedVxs = compound(totalVxs, process.env.BASSE_HPY, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs);
  return { [pool.name]: apy };
};

const getSupplyApys = async pool => {
  const venusPrice = await getPrice('pancake', 'XVS');
  const tokenPrice = await getPrice(pool.oracle, pool.oracleId);

  const vtokenContract = new web3.eth.Contract(VToken, pool.vtoken);
  const unitrollerContract = new web3.eth.Contract(IUnitroller, UNITROLLER);

  const supplyRate = new BigNumber(await vtokenContract.methods.supplyRatePerBlock().call());
  const supplyApyPerYear = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const venusRate = new BigNumber(await unitrollerContract.methods.venusSpeeds(pool.vtoken).call());
  const venusPerYear = venusRate.times(BLOCKS_PER_YEAR);
  const venusPerYearInUsd = venusPerYear.div('1e18').times(venusPrice);

  const totalSupply = new BigNumber(await vtokenContract.methods.totalSupply().call());
  const exchangeRateStored = new BigNumber(
    await vtokenContract.methods.exchangeRateStored().call()
  );
  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: venusPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async pool => {
  const venusPrice = await getPrice('pancake', 'XVS');
  const bnbPrice = await getPrice(pool.oracle, pool.oracleId);

  const unitrollerContract = new web3.eth.Contract(IUnitroller, UNITROLLER);
  const vtokenContract = new web3.eth.Contract(VToken, pool.vtoken);

  const borrowRate = new BigNumber(await vtokenContract.methods.borrowRatePerBlock().call());
  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');

  const venusRate = new BigNumber(await unitrollerContract.methods.venusSpeeds(pool.vtoken).call());
  const venusPerYear = venusRate.times(BLOCKS_PER_YEAR);
  const venusPerYearInUsd = venusPerYear.div('1e18').times(venusPrice);

  const totalBorrows = new BigNumber(await vtokenContract.methods.totalBorrows().call());
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

getVenusApys();

module.exports = getVenusApys;
