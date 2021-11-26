const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const Comptroller = require('../../../abis/heco/Comptroller.json');
const RewardDistributor = require('../../../abis/avax/RewardDistributor.json');
const IToken = require('../../../abis/avax/BankerJoeIToken.json');
const pools = require('../../../data/avax/bankerJoePools.json');
const { BASE_HPY } = require('../../../constants');

const rewardDistributor = '0x2274491950B2D6d79b7e69b683b482282ba14885';
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
  const compoundedVxs = compound(totalVxs, BASE_HPY, 1, 0.955);
  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedVxs).toNumber();
  return { [pool.name]: apy };
};

const getSupplyApys = async (pool, BLOCKS_PER_YEAR) => {
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);
  const rewardDistributorContract = new web3.eth.Contract(RewardDistributor, rewardDistributor);

  let [
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
    itokenContract.methods.supplyRatePerSecond().call(),
    rewardDistributorContract.methods.rewardSpeeds(0, pool.itoken).call(),
    rewardDistributorContract.methods.rewardSpeeds(1, pool.itoken).call(),
    itokenContract.methods.totalSupply().call(),
    itokenContract.methods.exchangeRateStored().call(),
  ]);

  supplyRate = new BigNumber(supplyRate);
  joeCompRate = new BigNumber(joeCompRate);
  avaxCompRate = new BigNumber(avaxCompRate);
  totalSupply = new BigNumber(totalSupply);
  exchangeRateStored = new BigNumber(exchangeRateStored);

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
  const rewardDistributorContract = new web3.eth.Contract(RewardDistributor, rewardDistributor);
  const itokenContract = new web3.eth.Contract(IToken, pool.itoken);

  let [joePrice, avaxPrice, tokenPrice, borrowRate, joeCompRate, avaxCompRate, totalBorrows] =
    await Promise.all([
      fetchPrice({ oracle: 'tokens', id: 'JOE' }),
      fetchPrice({ oracle: 'tokens', id: 'AVAX' }),
      fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
      itokenContract.methods.borrowRatePerSecond().call(),
      rewardDistributorContract.methods.rewardSpeeds(0, pool.itoken).call(),
      rewardDistributorContract.methods.rewardSpeeds(1, pool.itoken).call(),
      itokenContract.methods.totalBorrows().call(),
    ]);

  borrowRate = new BigNumber(borrowRate);
  joeCompRate = new BigNumber(joeCompRate);
  avaxCompRate = new BigNumber(avaxCompRate);
  totalBorrows = new BigNumber(totalBorrows);

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
