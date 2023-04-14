const BigNumber = require('bignumber.js');
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { OPTIMISM_CHAIN_ID } from '../../../constants';

const ExactlyRewardsController = require('../../../abis/ExactlyRewardsController.json');
const ExactlyInterestRateModel = require('../../../abis/ExactlyInterestRateModel.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getApyBreakdown } = require('../common/getApyBreakdown');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { BASE_HPY } = require('../../../constants');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const { getExactlyData } = require('../../../utils/getExactlyData')
const { exactlyClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
const pools = require('../../../data/optimism/exactlyPools.json');

const RewardsController = "0xBd1ba78A3976cAB420A9203E6ef14D18C2B2E031";
const reward = "0x4200000000000000000000000000000000000042";
const rewardOracleId = "OP";

const getExactlyApys = async () => {
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const apys = await Promise.all(promises);

  return getApyBreakdown(pools, null, apys, 0);
};

const getPoolApy = async (pool) => {
  const { supplyBase, supplyReward, borrowBase, borrowReward } = await getExactlyPoolData(pool);
  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyReward, leveragedBorrowReward } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyReward,
      borrowReward,
      pool.ltv
    );

  const totalReward = leveragedSupplyReward.plus(leveragedBorrowReward);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  const compoundedReward = compound(totalReward, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedReward);
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyReward.valueOf(), borrowReward.valueOf());
  return apy;
};

const getExactlyPoolData = async (pool) => {
  const { supplyBase, utilization } = await getExactlyData(exactlyClient, pool.market);

  const multicall = new MultiCall(web3, multicallAddress(OPTIMISM_CHAIN_ID));
  const rewardsController = getContractWithProvider(ExactlyRewardsController, RewardsController, web3);
  const interestRateModel = getContractWithProvider(ExactlyInterestRateModel, pool.interestRateModel, web3);
  const rewardControllerCalls = [];
  const interestRateModelCalls = [];

  rewardControllerCalls.push({ 
    indexStart: rewardsController.methods.previewAllocation(pool.market, reward, 0),
    indexEnd: rewardsController.methods.previewAllocation(pool.market, reward, 86400)
  });

  interestRateModelCalls.push({
    borrowBase: interestRateModel.methods.floatingRate(utilization.toString())
  });

  const res = await multicall.all([rewardControllerCalls, interestRateModelCalls]);

  const borrowIndexStart = new BigNumber(res[0].map(v => v.indexStart[0]));
  const supplyIndexStart = new BigNumber(res[0].map(v => v.indexStart[1]));
  const borrowIndexEnd = new BigNumber(res[0].map(v => v.indexEnd[0]));
  const supplyIndexEnd = new BigNumber(res[0].map(v => v.indexEnd[1]));
  const borrowBase = new BigNumber(res[1].map(v => v.borrowBase)).dividedBy('1e18');

  const borrowIndex = borrowIndexEnd.minus(borrowIndexStart);
  const supplyIndex = supplyIndexEnd.minus(supplyIndexStart);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardOracleId });
  const supplyReward = supplyIndex.times(rewardPrice).times(365).dividedBy(tokenPrice).div('1e18');
  const borrowReward = borrowIndex.times(rewardPrice).times(365).dividedBy(tokenPrice).div('1e18');

  return { supplyBase, supplyReward, borrowBase, borrowReward };
};

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyReward,
  borrowReward,
  ltv
) => {
  const leveragedSupplyBase = supplyBase.plus(supplyBase.times(ltv).dividedBy(1 - ltv));
  const leveragedBorrowBase = borrowBase.times(ltv).dividedBy(1 - ltv);
  const leveragedSupplyReward = supplyReward.plus(supplyReward.times(ltv).dividedBy(1 - ltv));
  const leveragedBorrowReward = borrowReward.times(ltv).dividedBy(1 - ltv);

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyReward,
    leveragedBorrowReward,
  };
};

module.exports = getExactlyApys;
