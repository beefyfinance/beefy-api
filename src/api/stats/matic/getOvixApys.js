const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { MultiCall } = require('eth-multicall');
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');
import { BASE_HPY, POLYGON_CHAIN_ID as chainId } from '../../../constants';
//const Comptroller = require('../../../abis/moonbeam/MoonwellComptroller.json');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const ImToken = require('../../../abis/moonbeam/mToken.json');
const IOvixRewarder = require('../../../abis/matic/IOvixRewarder.json');

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
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const supplyRateCalls = [];
  const epochDataCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  const borrowRateCalls = [];
  const totalBorrowCalls = [];
  const rewardContract = getContractWithProvider(IOvixRewarder, rewarder, web3);
  const epoch = await rewardContract.methods.epochNumber().call();
  pools.forEach(pool => {
    const mtokenContract = getContract(ImToken, pool.mtoken);
    const rewarderContract = getContract(IOvixRewarder, pool.reward.rewarder);
    supplyRateCalls.push({
      supplyRate: mtokenContract.methods.supplyRatePerTimestamp(),
    });
    epochDataCalls.push({
      epochData: rewarderContract.methods.epochParams(epoch),
    });
    totalSupplyCalls.push({
      totalSupply: mtokenContract.methods.totalSupply(),
    });
    exchangeRateCalls.push({
      exchangeRate: mtokenContract.methods.exchangeRateStored(),
    });
    borrowRateCalls.push({
      borrowRate: mtokenContract.methods.borrowRatePerTimestamp(),
    });
    totalBorrowCalls.push({
      totalBorrow: mtokenContract.methods.totalBorrows(),
    });
  });

  const res = await multicall.all([
    supplyRateCalls,
    epochDataCalls,
    totalSupplyCalls,
    exchangeRateCalls,
    borrowRateCalls,
    totalBorrowCalls,
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.supplyRate));
  const epochDatas = res[1].map(v => v.epochData);
  const totalSupplys = res[2].map(v => new BigNumber(v.totalSupply));
  const exchangeRates = res[3].map(v => new BigNumber(v.exchangeRate));
  const borrowRates = res[4].map(v => new BigNumber(v.borrowRate));
  const totalBorrows = res[5].map(v => new BigNumber(v.totalBorrow));

  return { supplyRates, epochDatas, totalSupplys, exchangeRates, borrowRates, totalBorrows };
};

module.exports = getOvixApys;
