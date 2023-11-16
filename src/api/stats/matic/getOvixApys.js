const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
import { BASE_HPY, POLYGON_CHAIN_ID } from '../../../constants';
import ImToken from '../../../abis/moonbeam/mToken';
import IOvixRewarder from '../../../abis/matic/IOvixRewarder';
import { fetchContract } from '../../rpc/client';
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const pools = require('../../../data/matic/ovixPools.json');
//const COMPTROLLER = '0x8849f1a0cB6b5D6076aB150546EddEe193754F1C';
const rewarder = '0xd1a21676Cb1a781f321f31DB3573757D2cbCc0B2';
const SECONDS_PER_YEAR = 31536000;

const getOvixApys = async () => {
  let apys = {};

  const { supplyRates, epochDatas, totalSupplys, exchangeRates, borrowRates, totalBorrows } =
    await getData(pools);

  for (let i = 0; i < pools.length; i++) {
    const { supplyBase, supplyVxs } = await getSupplyApys(
      supplyRates[i],
      epochDatas[i],
      totalSupplys[i],
      exchangeRates[i],
      pools[i]
    );
    const { borrowBase, borrowVxs } = await getBorrowApys(
      borrowRates[i],
      epochDatas[i],
      totalBorrows[i],
      pools[i]
    );
    const apy = getPoolApy(supplyBase, borrowBase, supplyVxs, borrowVxs, pools[i]);

    apys = { ...apys, ...apy };
  }

  return apys;
};

const getPoolApy = (supplyBase, borrowBase, supplyVxs, borrowVxs, pool) => {
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

const getSupplyApys = async (supplyRate, epochData, totalSupply, exchangeRateStored, pool) => {
  let [rewardPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: pool.reward.oracleId }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const supplyApyPerYear = supplyRate.times(SECONDS_PER_YEAR).div('1e18');

  const rewardSupplyRate = new BigNumber(epochData['2']);
  const rewardPerYear = rewardSupplyRate.times(365);
  const rewardPerYearInUsd = rewardPerYear.div('1e18').times(rewardPrice);

  const totalSupplied = totalSupply.times(exchangeRateStored).div('1e18');
  const totalSuppliedInUsd = totalSupplied.div(pool.decimals).times(tokenPrice);

  return {
    supplyBase: supplyApyPerYear,
    supplyVxs: rewardPerYearInUsd.div(totalSuppliedInUsd),
  };
};

const getBorrowApys = async (borrowRate, epochData, totalBorrows, pool) => {
  let [rewardPrice, tokenPrice] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: pool.reward.oracleId }),
    fetchPrice({ oracle: pool.oracle, id: pool.oracleId }),
  ]);

  const borrowApyPerYear = borrowRate.times(SECONDS_PER_YEAR).div('1e18');

  const rewardBorrowRate = new BigNumber(epochData['3']);
  const rewardPerYear = rewardBorrowRate.times(365);
  const rewardPerYearInUsd = rewardPerYear.div('1e18').times(rewardPrice);

  const totalBorrowsInUsd = totalBorrows.div(pool.decimals).times(tokenPrice);

  return {
    borrowBase: borrowApyPerYear,
    borrowVxs: rewardPerYearInUsd.div(totalBorrowsInUsd),
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

const getData = async pools => {
  const supplyRateCalls = [];
  const epochDataCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const borrowRateCalls = [];
  const totalBorrowCalls = [];
  const rewardContract = fetchContract(rewarder, IOvixRewarder, POLYGON_CHAIN_ID);
  const epoch = await rewardContract.read.epochNumber();
  pools.forEach(pool => {
    const mtokenContract = fetchContract(pool.mtoken, ImToken, POLYGON_CHAIN_ID);
    const rewarderContract = fetchContract(pool.reward.rewarder, IOvixRewarder, POLYGON_CHAIN_ID);
    supplyRateCalls.push(mtokenContract.read.supplyRatePerTimestamp());
    epochDataCalls.push(rewarderContract.read.epochParams([epoch]));
    totalSupplyCalls.push(mtokenContract.read.totalSupply());
    exchangeRateCalls.push(mtokenContract.read.exchangeRateStored());
    borrowRateCalls.push(mtokenContract.read.borrowRatePerTimestamp());
    totalBorrowCalls.push(mtokenContract.read.totalBorrows());
  });

  const res = await Promise.all([
    Promise.all(supplyRateCalls),
    Promise.all(epochDataCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(exchangeRateCalls),
    Promise.all(borrowRateCalls),
    Promise.all(totalBorrowCalls),
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.toString()));
  const epochDatas = res[1].map(v => v.map(m => new BigNumber(m.toString())));
  const totalSupplys = res[2].map(v => new BigNumber(v.toString()));
  const exchangeRates = res[3].map(v => new BigNumber(v.toString()));
  const borrowRates = res[4].map(v => new BigNumber(v.toString()));
  const totalBorrows = res[5].map(v => new BigNumber(v.toString()));

  return { supplyRates, epochDatas, totalSupplys, exchangeRates, borrowRates, totalBorrows };
};

module.exports = getOvixApys;
