const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
import { BASE_HPY, BASE_CHAIN_ID as chainId } from '../../../constants';
import RewardsController from '../../../abis/base/RewardsController';
import ImToken from '../../../abis/moonbeam/mToken';
import { fetchContract } from '../../rpc/client';
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const pools = require('../../../data/base/moonwellPools.json');
const Rewards = '0xe9005b078701e2A0948D2EaC43010D35870Ad9d2';
const WELL = '0xFF8adeC2221f9f4D8dfbAFa6B9a297d17603493D';
const SECONDS_PER_YEAR = 31536000;

const getMoonwellBaseApys = async () => {
  let apys = {};

  const [
    { supplyRates, wellSupplyRates, totalSupplys, exchangeRates },
    { borrowRates, wellBorrowRates, totalBorrows },
  ] = await Promise.all([getSupplyData(pools), getBorrowData(pools)]);

  for (let i = 0; i < pools.length; i++) {
    const { supplyBase, supplyVxs } = await getSupplyApys(
      supplyRates[i],
      wellSupplyRates[i],
      totalSupplys[i],
      exchangeRates[i],
      pools[i]
    );
    const { borrowBase, borrowVxs } = await getBorrowApys(
      borrowRates[i],
      wellBorrowRates[i],
      totalBorrows[i],
      pools[i]
    );
    const apy = await getPoolApy(supplyBase, borrowBase, supplyVxs, borrowVxs, pools[i]);

    apys = { ...apys, ...apy };
  }

  return apys;
};

const getPoolApy = async (supplyBase, borrowBase, supplyVxs, borrowVxs, pool) => {
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
  // console.log(pool.name, apy);
  return { [pool.name]: apy };
};

const getSupplyApys = async (supplyRate, wellSupplyRate, totalSupply, exchangeRateStored, pool) => {
  let [wellPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WELL' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const supplyApyPerYear = supplyRate.times(SECONDS_PER_YEAR).div('1e18');

  const wellPerYear = wellSupplyRate.times(SECONDS_PER_YEAR);
  const wellPerYearInUsd = wellPerYear.div('1e18').times(wellPrice);

  const yearlyRewardsInUsd = wellPerYearInUsd;

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: yearlyRewardsInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (borrowRate, wellBorrowRate, totalBorrows, pool) => {
  let [wellPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WELL' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const borrowApyPerYear = borrowRate.times(SECONDS_PER_YEAR).div('1e18');

  const wellPerYear = wellBorrowRate.times(SECONDS_PER_YEAR);
  const wellPerYearInUsd = wellPerYear.div('1e18').times(wellPrice);

  const yearlyRewardsInUsd = wellPerYearInUsd;

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(tokenPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowVxs: yearlyRewardsInUsd.div(totalBorrowsInUsd),
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

const getSupplyData = async pools => {
  const supplyRateCalls = [];
  const wellSupplyRateCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const rewardsContract = fetchContract(Rewards, RewardsController, chainId);
  pools.forEach(pool => {
    const mtokenContract = fetchContract(pool.mtoken, ImToken, chainId);
    supplyRateCalls.push(mtokenContract.read.supplyRatePerTimestamp());
    wellSupplyRateCalls.push(rewardsContract.read.getConfigForMarket([pool.mtoken, WELL]));
    totalSupplyCalls.push(mtokenContract.read.totalSupply());
    exchangeRateCalls.push(mtokenContract.read.exchangeRateStored());
  });

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(wellSupplyRateCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.toString()));
  const wellSupplyRates = res[1].map(v => new BigNumber(v.supplyEmissionsPerSec.toString()));
  const totalSupplys = res[2].map(v => new BigNumber(v.toString()));
  const exchangeRates = res[3].map(v => new BigNumber(v.toString()));
  return { supplyRates, wellSupplyRates, totalSupplys, exchangeRates };
};

const getBorrowData = async pools => {
  const borrowRateCalls = [];
  const wellBorrowRateCalls = [];
  const totalBorrowCalls = [];
  const rewardsContract = fetchContract(Rewards, RewardsController, chainId);
  pools.forEach(pool => {
    const mtokenContract = fetchContract(pool.mtoken, ImToken, chainId);
    borrowRateCalls.push(mtokenContract.read.borrowRatePerTimestamp());
    wellBorrowRateCalls.push(rewardsContract.read.getConfigForMarket([pool.mtoken, WELL]));
    totalBorrowCalls.push(mtokenContract.read.totalBorrows());
  });

  const res = await Promise.all([
    Promise.all(borrowRateCalls),
    Promise.all(wellBorrowRateCalls),
    Promise.all(totalBorrowCalls),
  ]);

  const borrowRates = res[0].map(v => new BigNumber(v.toString()));
  const wellBorrowRates = res[1].map(v => new BigNumber(v.borrowEmissionsPerSec.toString()));
  const totalBorrows = res[2].map(v => new BigNumber(v.toString()));
  return { borrowRates, wellBorrowRates, totalBorrows };
};

module.exports = getMoonwellBaseApys;
