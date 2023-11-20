const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
const pools = require('../../../data/fantom/screamPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
const { BASE_HPY, FANTOM_CHAIN_ID: chainId, FANTOM_CHAIN_ID } = require('../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { default: VToken } = require('../../../abis/VToken');
const { default: Comptroller } = require('../../../abis/heco/Comptroller');
const { fetchContract } = require('../../rpc/client');

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
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  const compoundedVxs = compound(totalVxs, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  return { [pool.name]: apy };
};

const getSupplyApys = async (pool, BLOCKS_PER_YEAR) => {
  const itokenContract = fetchContract(pool.itoken, VToken, FANTOM_CHAIN_ID);
  const comptrollerContract = fetchContract(COMPTROLLER, Comptroller, FANTOM_CHAIN_ID);

  let [screamPrice, tokenPrice, supplyRate, compRate, totalSupply, exchangeRateStored] =
    await Promise.all([
      fetchPrice({ oracle: 'tokens', id: 'SCREAM' }),
      fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
      itokenContract.read.supplyRatePerBlock().then(res => new BigNumber(res.toString())),
      comptrollerContract.read.compSpeeds([pool.itoken]).then(res => new BigNumber(res.toString())),
      itokenContract.read.totalSupply().then(res => new BigNumber(res.toString())),
      itokenContract.read.exchangeRateStored().then(res => new BigNumber(res.toString())),
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
  const comptrollerContract = fetchContract(COMPTROLLER, Comptroller, FANTOM_CHAIN_ID);
  const itokenContract = fetchContract(pool.itoken, VToken, FANTOM_CHAIN_ID);

  const [screamPrice, tokenPrice, borrowRate, compRate, totalBorrows] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'SCREAM' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    itokenContract.read.borrowRatePerBlock().then(res => new BigNumber(res.toString())),
    comptrollerContract.read.compSpeeds([pool.itoken]).then(res => new BigNumber(res.toString())),
    itokenContract.read.totalBorrows().then(res => new BigNumber(res.toString())),
  ]);

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

module.exports = getScreamApys;
