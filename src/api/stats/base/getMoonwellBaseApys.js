const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
import { BASE_HPY, BASE_CHAIN_ID as chainId } from '../../../constants';
import RewardsController from '../../../abis/base/RewardsController';
import ImToken from '../../../abis/moonbeam/mToken';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';
import jp from 'jsonpath';

const pools = require('../../../data/base/moonwellPools.json');
const Rewards = '0xe9005b078701e2A0948D2EaC43010D35870Ad9d2';
const WELL = '0xFF8adeC2221f9f4D8dfbAFa6B9a297d17603493D';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const SECONDS_PER_YEAR = 31536000;

const getMoonwellBaseApys = async () => {
  let leveragedBaseAprs = [];
  let leveragedRewardAprs = [];
  let leveragedLsAprs = [];

  const [
    { supplyRates, wellSupplyRates, usdcSupplyRates, totalSupplys, exchangeRates, lsAprs },
    { borrowRates, wellBorrowRates, totalBorrows },
  ] = await Promise.all([getSupplyData(pools), getBorrowData(pools)]);

  for (let i = 0; i < pools.length; i++) {
    const { supplyBase, supplyVxs } = await getSupplyApys(
      supplyRates[i],
      wellSupplyRates[i],
      usdcSupplyRates[i],
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

    const { leveragedBaseApr, leveragedRewardApr, leveragedLsApr } = await getPoolApy(
      supplyBase,
      borrowBase,
      supplyVxs,
      borrowVxs,
      lsAprs[i],
      pools[i]
    );

    leveragedBaseAprs.push(leveragedBaseApr);
    leveragedRewardAprs.push(leveragedRewardApr);
    leveragedLsAprs.push(leveragedLsApr.toNumber());
  }

  return getApyBreakdown(
    pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(pools.map((p, i) => [p.name, leveragedBaseAprs[i]])),
    leveragedRewardAprs,
    0,
    leveragedLsAprs
  );
};

const getPoolApy = async (supplyBase, borrowBase, supplyVxs, borrowVxs, lsApr, pool) => {
  const {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
    leveragedSupplyLs,
    leveragedBorrowLs,
  } = getLeveragedApys(
    supplyBase,
    borrowBase,
    supplyVxs,
    borrowVxs,
    lsApr,
    pool.borrowDepth,
    pool.borrowPercent
  );

  const leveragedBaseApr = leveragedSupplyBase.minus(leveragedBorrowBase);
  const leveragedRewardApr = leveragedSupplyVxs.plus(leveragedBorrowVxs);
  const leveragedLsApr = leveragedSupplyLs.minus(leveragedBorrowLs);
  // console.log(pool.name, leveragedBaseApr, leveragedRewardApr, leveragedLsApr);
  return { leveragedBaseApr, leveragedRewardApr, leveragedLsApr };
};

const getSupplyApys = async (
  supplyRate,
  wellSupplyRate,
  usdcSupplyRate,
  totalSupply,
  exchangeRateStored,
  pool
) => {
  let [wellPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: 'WELL' }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const supplyApyPerYear = supplyRate.times(SECONDS_PER_YEAR).div('1e18');

  const wellPerYear = wellSupplyRate.times(SECONDS_PER_YEAR);
  const wellPerYearInUsd = wellPerYear.div('1e18').times(wellPrice);

  const usdcPerYear = usdcSupplyRate.times(SECONDS_PER_YEAR);
  const usdcPerYearInUsd = usdcPerYear.div('1e6');

  const yearlyRewardsInUsd = wellPerYearInUsd.plus(usdcPerYearInUsd);

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

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyVxs,
  borrowVxs,
  lsApr,
  depth,
  borrowPercent
) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyVxs = new BigNumber(0);
  let leveragedBorrowVxs = new BigNumber(0);
  let leveragedSupplyLs = new BigNumber(0);
  let leveragedBorrowLs = new BigNumber(0);

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

    leveragedSupplyLs = leveragedSupplyLs.plus(lsApr.times(borrowPercent.exponentiatedBy(i)));
    leveragedBorrowLs = leveragedBorrowLs.plus(lsApr.times(borrowPercent.exponentiatedBy(i + 1)));
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyVxs,
    leveragedBorrowVxs,
    leveragedSupplyLs,
    leveragedBorrowLs,
  };
};

const getSupplyData = async pools => {
  const supplyRateCalls = [];
  const wellSupplyRateCalls = [];
  const usdcSupplyRateCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const rewardsContract = fetchContract(Rewards, RewardsController, chainId);
  pools.forEach(pool => {
    const mtokenContract = fetchContract(pool.mtoken, ImToken, chainId);
    supplyRateCalls.push(mtokenContract.read.supplyRatePerTimestamp());
    wellSupplyRateCalls.push(rewardsContract.read.getConfigForMarket([pool.mtoken, WELL]));
    usdcSupplyRateCalls.push(rewardsContract.read.getConfigForMarket([pool.mtoken, USDC]));
    totalSupplyCalls.push(mtokenContract.read.totalSupply());
    exchangeRateCalls.push(mtokenContract.read.exchangeRateStored());
  });

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(wellSupplyRateCalls),
    Promise.all(usdcSupplyRateCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
    getLiquidStakingApys(),
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.toString()));
  const wellSupplyRates = res[1].map(v => new BigNumber(v.supplyEmissionsPerSec.toString()));
  const usdcSupplyRates = res[2].map(v => new BigNumber(v.supplyEmissionsPerSec.toString()));
  const totalSupplys = res[3].map(v => new BigNumber(v.toString()));
  const exchangeRates = res[4].map(v => new BigNumber(v.toString()));
  const lsAprs = res[5].map(v => new BigNumber(v.toString()));
  return { supplyRates, wellSupplyRates, usdcSupplyRates, totalSupplys, exchangeRates, lsAprs };
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

const getLiquidStakingApys = async () => {
  let liquidStakingAprs = [];

  for (let i = 0; i < pools.length; i++) {
    if (pools[i].lsUrl) {
      //Normalize ls Data to always handle arrays
      //Coinbase's returned APR is already in %, we need to normalize it by multiplying by 100
      let lsAprFactor = 1;
      if (pools[i].lsAprFactor) lsAprFactor = pools[i].lsAprFactor;

      let lsApr = 0;
      try {
        const url = pools[i].lsUrl;
        const lsResponse = await fetch(url).then(res => res.json());
        lsApr = jp.query(lsResponse, pools[i].dataPath)[0];
        lsApr = (lsApr * lsAprFactor) / 100;
        liquidStakingAprs.push(lsApr);
      } catch {
        console.error(`Failed to fetch ${pools[i].name} liquid staking APR from ${pools[i].lsUrl}`);
      }
    } else {
      liquidStakingAprs.push(0);
    }
  }
  return liquidStakingAprs;
};

module.exports = getMoonwellBaseApys;
