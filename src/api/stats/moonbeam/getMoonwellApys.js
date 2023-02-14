const BigNumber = require('bignumber.js');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { MultiCall } = require('eth-multicall');
import { getContract } from '../../../utils/contractHelper';
const { moonbeamWeb3: web3, multicallAddress } = require('../../../utils/web3');
import { BASE_HPY, MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
const Comptroller = require('../../../abis/moonbeam/MoonwellComptroller.json');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const ImToken = require('../../../abis/moonbeam/mToken.json');

const pools = require('../../../data/moonbeam/moonwellPools.json');
const COMPTROLLER = '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180';
const SECONDS_PER_YEAR = 31536000;

const getMoonwellApys = async () => {
  let apys = {};

  const { supplyRates, wellSupplyRates, glmrSupplyRates, totalSupplys, exchangeRates } =
    await getSupplyData(pools);
  const { borrowRates, wellBorrowRates, glmrBorrowRates, totalBorrows } = await getBorrowData(
    pools
  );

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
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const supplyRateCalls = [];
  const wellSupplyRateCalls = [];
  const glmrSupplyRateCalls = [];
  const totalSupplyCalls = [];
  const exchangeRateCalls = [];
  pools.forEach(pool => {
    const comptrollerContract = getContract(Comptroller, COMPTROLLER);
    const mtokenContract = getContract(ImToken, pool.mtoken);
    supplyRateCalls.push({
      supplyRate: mtokenContract.methods.supplyRatePerTimestamp(),
    });
    wellSupplyRateCalls.push({
      wellSupplyRate: comptrollerContract.methods.supplyRewardSpeeds(0, pool.mtoken),
    });
    glmrSupplyRateCalls.push({
      glmrSupplyRate: comptrollerContract.methods.supplyRewardSpeeds(1, pool.mtoken),
    });
    totalSupplyCalls.push({
      totalSupply: mtokenContract.methods.totalSupply(),
    });
    exchangeRateCalls.push({
      exchangeRate: mtokenContract.methods.exchangeRateStored(),
    });
  });

  const res = await multicall.all([
    supplyRateCalls,
    wellSupplyRateCalls,
    glmrSupplyRateCalls,
    totalSupplyCalls,
    exchangeRateCalls,
  ]);

  const supplyRates = res[0].map(v => new BigNumber(v.supplyRate));
  const wellSupplyRates = res[1].map(v => new BigNumber(v.wellSupplyRate));
  const glmrSupplyRates = res[2].map(v => new BigNumber(v.glmrSupplyRate));
  const totalSupplys = res[3].map(v => new BigNumber(v.totalSupply));
  const exchangeRates = res[4].map(v => new BigNumber(v.exchangeRate));
  return { supplyRates, wellSupplyRates, glmrSupplyRates, totalSupplys, exchangeRates };
};

const getBorrowData = async pools => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const borrowRateCalls = [];
  const wellBorrowRateCalls = [];
  const glmrBorrowRateCalls = [];
  const totalBorrowCalls = [];
  pools.forEach(pool => {
    const comptrollerContract = getContract(Comptroller, COMPTROLLER);
    const mtokenContract = getContract(ImToken, pool.mtoken);
    borrowRateCalls.push({
      borrowRate: mtokenContract.methods.borrowRatePerTimestamp(),
    });
    wellBorrowRateCalls.push({
      wellBorrowRate: comptrollerContract.methods.borrowRewardSpeeds(0, pool.mtoken),
    });
    glmrBorrowRateCalls.push({
      glmrBorrowRate: comptrollerContract.methods.borrowRewardSpeeds(1, pool.mtoken),
    });
    totalBorrowCalls.push({
      totalBorrow: mtokenContract.methods.totalBorrows(),
    });
  });

  const res = await multicall.all([
    borrowRateCalls,
    wellBorrowRateCalls,
    glmrBorrowRateCalls,
    totalBorrowCalls,
  ]);

  const borrowRates = res[0].map(v => new BigNumber(v.borrowRate));
  const wellBorrowRates = res[1].map(v => new BigNumber(v.wellBorrowRate));
  const glmrBorrowRates = res[2].map(v => new BigNumber(v.glmrBorrowRate));
  const totalBorrows = res[3].map(v => new BigNumber(v.totalBorrow));
  return { borrowRates, wellBorrowRates, glmrBorrowRates, totalBorrows };
};

module.exports = getMoonwellApys;
