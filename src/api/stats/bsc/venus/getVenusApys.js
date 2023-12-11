const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../../utils/fetchPrice';
const pools = require('../../../../data/venusPools.json');
const { BSC_CHAIN_ID } = require('../../../../constants');
const { default: VToken } = require('../../../../abis/VToken');
const { fetchContract } = require('../../../rpc/client');
const { default: IUnitroller } = require('../../../../abis/IUnitroller');
const { getApyBreakdown } = require('../../common/getApyBreakdown');

const UNITROLLER = '0xfD36E2c2a6789Db23113685031d7F16329158384';
const BLOCKS_PER_YEAR = 10512000;

const getVenusApys = async () => {
  const rewardApys = [];
  const lendingApys = [];
  const promises = [];

  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => {
    rewardApys.push(item[0]);
    lendingApys.push(item[1]);
  });

  return getApyBreakdown(
    pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(pools.map((p, i) => [p.name, lendingApys[i]])),
    rewardApys
  );
};

const getPoolApy = async pool => {
  const [{ supplyBase, supplyVxs }, { borrowBase, borrowVxs }] = await Promise.all([
    getSupplyApys(pool),
    getBorrowApys(pool),
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
  const lendingApy = leveragedSupplyBase.minus(leveragedBorrowBase);
  return [totalVxs, lendingApy];
};

const getSupplyApys = async pool => {
  const vtokenContract = fetchContract(pool.vtoken, VToken, BSC_CHAIN_ID);
  const unitrollerContract = fetchContract(UNITROLLER, IUnitroller, BSC_CHAIN_ID);

  let [venusPrice, tokenPrice, supplyRate, venusRate, totalSupply, exchangeRateStored] =
    await Promise.all([
      fetchPrice({ oracle: 'tokens', id: 'XVS' }),
      fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
      vtokenContract.read.supplyRatePerBlock().then(res => new BigNumber(res.toString())),
      unitrollerContract.read
        .venusSupplySpeeds([pool.vtoken])
        .then(res => new BigNumber(res.toString())),
      vtokenContract.read.totalSupply().then(res => new BigNumber(res.toString())),
      vtokenContract.read.exchangeRateStored().then(res => new BigNumber(res.toString())),
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
  const unitrollerContract = fetchContract(UNITROLLER, IUnitroller, BSC_CHAIN_ID);
  const vtokenContract = fetchContract(pool.vtoken, VToken, BSC_CHAIN_ID);

  let [venusPrice, bnbPrice, borrowRate, venusRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'XVS' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    vtokenContract.read.borrowRatePerBlock().then(res => new BigNumber(res.toString())),
    unitrollerContract.read
      .venusBorrowSpeeds([pool.vtoken])
      .then(res => new BigNumber(res.toString())),
    vtokenContract.read.totalBorrows().then(res => new BigNumber(res.toString())),
  ]);

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

  for (let i = 0; i < depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(i))
    );
    leveragedSupplyVxs = leveragedSupplyVxs.plus(supplyVxs.times(borrowPercent.exponentiatedBy(i)));

    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(i + 1))
    );
    leveragedBorrowVxs = leveragedBorrowVxs.plus(
      borrowVxs.times(borrowPercent.exponentiatedBy(i + 1))
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
