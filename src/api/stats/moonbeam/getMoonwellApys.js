const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
import { BASE_HPY, MOONBEAM_CHAIN_ID, MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import MoonwellComptroller from '../../../abis/moonbeam/MoonwellComptroller';
import ImToken from '../../../abis/moonbeam/mToken';
import { fetchContract } from '../../rpc/client';
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const pools = require('../../../data/moonbeam/moonwellPools.json');
const COMPTROLLER = '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180';
const SECONDS_PER_YEAR = 31536000;

const getMoonwellApys = async () => {
  let apys = {};

  const [
    { supplyRates, wellSupplyRates, glmrSupplyRates, totalSupplys, exchangeRates },
    { borrowRates, wellBorrowRates, glmrBorrowRates, totalBorrows },
  ] = await Promise.all([getSupplyData(pools), getBorrowData(pools)]);

  for (let i = 0; i < pools.length; i++) {
    const { supplyBase, supplyVxs } = await getSupplyApys(
      supplyRates[i],
      wellSupplyRates[i],
      glmrSupplyRates[i],
      totalSupplys[i],
      exchangeRates[i],
      pools[i]
    );
    const { borrowBase, borrowVxs } = await getBorrowApys(
      borrowRates[i],
      wellBorrowRates[i],
      glmrBorrowRates[i],
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

const getSupplyApys = async (
  supplyRate,
  wellSupplyRate,
  glmrSupplyRate,
  totalSupply,
  exchangeRateStored,
  pool
) => {
  let [wellPrice, glmrPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WELL' }),
    fetchPrice({ oracle: 'tokens', id: 'GLMR' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const supplyApyPerYear = supplyRate.times(SECONDS_PER_YEAR).div('1e18');

  const wellPerYear = wellSupplyRate.times(SECONDS_PER_YEAR);
  const wellPerYearInUsd = wellPerYear.div('1e18').times(wellPrice);

  const gmlrPerYear = glmrSupplyRate.times(SECONDS_PER_YEAR);
  const gmlrPerYearInUsd = gmlrPerYear.div('1e18').times(glmrPrice);

  const yearlyRewardsInUsd = wellPerYearInUsd.plus(gmlrPerYearInUsd);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: yearlyRewardsInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (borrowRate, wellBorrowRate, glmrBorrowRate, totalBorrows, pool) => {
  let [wellPrice, glmrPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WELL' }),
    fetchPrice({ oracle: 'tokens', id: 'GLMR' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const borrowApyPerYear = borrowRate.times(SECONDS_PER_YEAR).div('1e18');

  const wellPerYear = wellBorrowRate.times(SECONDS_PER_YEAR);
  const wellPerYearInUsd = wellPerYear.div('1e18').times(wellPrice);

  const gmlrPerYear = glmrBorrowRate.times(SECONDS_PER_YEAR);
  const gmlrPerYearInUsd = gmlrPerYear.div('1e18').times(glmrPrice);

  const yearlyRewardsInUsd = wellPerYearInUsd.plus(gmlrPerYearInUsd);

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
  const glmrSupplyRateCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const comptrollerContract = fetchContract(COMPTROLLER, MoonwellComptroller, MOONBEAM_CHAIN_ID);
  pools.forEach(pool => {
    const mtokenContract = fetchContract(pool.mtoken, ImToken, MOONBEAM_CHAIN_ID);
    supplyRateCalls.push(mtokenContract.read.supplyRatePerTimestamp());
    wellSupplyRateCalls.push(comptrollerContract.read.supplyRewardSpeeds([0, pool.mtoken]));
    glmrSupplyRateCalls.push(comptrollerContract.read.supplyRewardSpeeds([1, pool.mtoken]));
    totalSupplyCalls.push(mtokenContract.read.totalSupply());
    exchangeRateCalls.push(mtokenContract.read.exchangeRateStored());
  });

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(wellSupplyRateCalls),
    Promise.all(glmrSupplyRateCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.toString()));
  const wellSupplyRates = res[1].map(v => new BigNumber(v.toString()));
  const glmrSupplyRates = res[2].map(v => new BigNumber(v.toString()));
  const totalSupplys = res[3].map(v => new BigNumber(v.toString()));
  const exchangeRates = res[4].map(v => new BigNumber(v.toString()));
  return { supplyRates, wellSupplyRates, glmrSupplyRates, totalSupplys, exchangeRates };
};

const getBorrowData = async pools => {
  const borrowRateCalls = [];
  const wellBorrowRateCalls = [];
  const glmrBorrowRateCalls = [];
  const totalBorrowCalls = [];
  const comptrollerContract = fetchContract(COMPTROLLER, MoonwellComptroller, chainId);
  pools.forEach(pool => {
    const mtokenContract = fetchContract(pool.mtoken, ImToken, chainId);
    borrowRateCalls.push(mtokenContract.read.borrowRatePerTimestamp());
    wellBorrowRateCalls.push(comptrollerContract.read.borrowRewardSpeeds([0, pool.mtoken]));
    glmrBorrowRateCalls.push(comptrollerContract.read.borrowRewardSpeeds([1, pool.mtoken]));
    totalBorrowCalls.push(mtokenContract.read.totalBorrows());
  });

  const res = await Promise.all([
    Promise.all(borrowRateCalls),
    Promise.all(wellBorrowRateCalls),
    Promise.all(glmrBorrowRateCalls),
    Promise.all(totalBorrowCalls),
  ]);

  const borrowRates = res[0].map(v => new BigNumber(v.toString()));
  const wellBorrowRates = res[1].map(v => new BigNumber(v.toString()));
  const glmrBorrowRates = res[2].map(v => new BigNumber(v.toString()));
  const totalBorrows = res[3].map(v => new BigNumber(v.toString()));
  return { borrowRates, wellBorrowRates, glmrBorrowRates, totalBorrows };
};

module.exports = getMoonwellApys;
