const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
const pools = require('../../../data/avax/bankerJoePools.json');
const { BASE_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { default: BankerJoeIToken } = require('../../../abis/avax/BankerJoeIToken');
const { fetchContract } = require('../../rpc/client');
const { default: RewardDistributor } = require('../../../abis/avax/RewardDistributor');

const rewardDistributor = '0x45B2C4139d96F44667577C0D7F7a7D170B420324';
const BLOCKS_PER_YEAR = 31536000;

const getBankerJoeApys = async () => {
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
  const itokenContract = fetchContract(pool.itoken, BankerJoeIToken, AVAX_CHAIN_ID);
  const rewardDistributorContract = fetchContract(
    rewardDistributor,
    RewardDistributor,
    AVAX_CHAIN_ID
  );

  const [
    joePrice,
    avaxPrice,
    tokenPrice,
    supplyRate,
    joeCompRate,
    avaxCompRate,
    totalSupply,
    exchangeRateStored,
  ] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'JOE' }),
    fetchPrice({ oracle: 'tokens', id: 'AVAX' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
    itokenContract.read.supplyRatePerSecond().then(rate => new BigNumber(rate.toString())),
    rewardDistributorContract.read
      .rewardSupplySpeeds([0, pool.itoken])
      .then(speed => new BigNumber(speed.toString())),
    rewardDistributorContract.read
      .rewardSupplySpeeds([1, pool.itoken])
      .then(speed => new BigNumber(speed.toString())),
    itokenContract.read.totalSupply().then(supply => new BigNumber(supply.toString())),
    itokenContract.read.exchangeRateStored().then(rate => new BigNumber(rate.toString())),
  ]);

  const supplyApyPerYear = supplyRate.times(BLOCKS_PER_YEAR).div('1e18');

  const joeCompPerYear = joeCompRate.times(BLOCKS_PER_YEAR);
  const joeCompPerYearInUsd = joeCompPerYear.div('1e18').times(joePrice);
  const avaxCompPerYear = avaxCompRate.times(BLOCKS_PER_YEAR);
  const avaxCompPerYearInUsd = avaxCompPerYear.div('1e18').times(avaxPrice);

  const compPerYearInUsd = joeCompPerYearInUsd.plus(avaxCompPerYearInUsd);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: compPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (pool, BLOCKS_PER_YEAR) => {
  const rewardDistributorContract = fetchContract(
    rewardDistributor,
    RewardDistributor,
    AVAX_CHAIN_ID
  );
  const itokenContract = fetchContract(pool.itoken, BankerJoeIToken, AVAX_CHAIN_ID);

  const [joePrice, avaxPrice, tokenPrice, borrowRate, joeCompRate, avaxCompRate, totalBorrows] =
    await Promise.all([
      fetchPrice({ oracle: 'tokens', id: 'JOE' }),
      fetchPrice({ oracle: 'tokens', id: 'AVAX' }),
      fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
      itokenContract.read.borrowRatePerSecond().then(rate => new BigNumber(rate.toString())),
      rewardDistributorContract.read
        .rewardBorrowSpeeds([0, pool.itoken])
        .then(speed => new BigNumber(speed.toString())),
      rewardDistributorContract.read
        .rewardBorrowSpeeds([1, pool.itoken])
        .then(speed => new BigNumber(speed.toString())),
      itokenContract.read.totalBorrows().then(borrows => new BigNumber(borrows.toString())),
    ]);

  const borrowApyPerYear = borrowRate.times(BLOCKS_PER_YEAR).div('1e18');

  const joeCompPerYear = joeCompRate.times(BLOCKS_PER_YEAR);
  const joeCompPerYearInUsd = joeCompPerYear.div('1e18').times(joePrice);
  const avaxCompPerYear = avaxCompRate.times(BLOCKS_PER_YEAR);
  const avaxCompPerYearInUsd = avaxCompPerYear.div('1e18').times(avaxPrice);

  const compPerYearInUsd = joeCompPerYearInUsd.plus(avaxCompPerYearInUsd);

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

module.exports = getBankerJoeApys;
