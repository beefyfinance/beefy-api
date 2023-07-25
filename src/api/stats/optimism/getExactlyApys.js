const BigNumber = require('bignumber.js');
import { OPTIMISM_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import ExactlyRewardsController from '../../../abis/ExactlyRewardsController';
import ExactlyInterestRateModel from '../../../abis/ExactlyInterestRateModel';

const fetchPrice = require('../../../utils/fetchPrice');
const { getApyBreakdown } = require('../common/getApyBreakdown');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { BASE_HPY } = require('../../../constants');
const { getExactlyData } = require('../../../utils/getExactlyData');
const { exactlyClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
const pools = require('../../../data/optimism/exactlyPools.json');

const RewardsController = '0xBd1ba78A3976cAB420A9203E6ef14D18C2B2E031';
const reward = '0x4200000000000000000000000000000000000042';
const rewardOracleId = 'OP';

const getExactlyApys = async () => {
  const apys = [];
  const lsAprs = [];
  let promises = [];

  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => {
    apys.push(item[0]);
    lsAprs.push(item[1]);
  });

  return getApyBreakdown(pools, null, apys, 0, lsAprs);
};

const getPoolApy = async pool => {
  const { supplyBase, supplyReward, borrowBase, borrowReward, lsApr } = await getExactlyPoolData(
    pool
  );
  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyReward, leveragedBorrowReward } =
    getLeveragedApys(supplyBase, borrowBase, supplyReward, borrowReward, pool.ltv);

  const totalReward = leveragedSupplyReward.plus(leveragedBorrowReward);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(pool.name);
  const compoundedReward = compound(totalReward, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

  const apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedReward);
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyReward.valueOf(), borrowReward.valueOf());
  return [apy, lsApr];
};

const getExactlyPoolData = async pool => {
  const { supplyBase, utilization } = await getExactlyData(exactlyClient, pool.market);

  const rewardsController = fetchContract(
    RewardsController,
    ExactlyRewardsController,
    OPTIMISM_CHAIN_ID
  );
  const interestRateModel = fetchContract(
    pool.interestRateModel,
    ExactlyInterestRateModel,
    OPTIMISM_CHAIN_ID
  );

  const indexStartCall = rewardsController.read.previewAllocation([pool.market, reward, 0]);
  const indexEndCall = rewardsController.read.previewAllocation([pool.market, reward, 86400]);
  const borrowBaseCall = interestRateModel.read.floatingRate([utilization.toString()]);

  const res = await Promise.all([indexStartCall, indexEndCall, borrowBaseCall]);

  const borrowIndexStart = new BigNumber(res[0][0].toString());
  const supplyIndexStart = new BigNumber(res[0][1].toString());
  const borrowIndexEnd = new BigNumber(res[1][0].toString());
  const supplyIndexEnd = new BigNumber(res[1][1].toString());
  const borrowBase = new BigNumber(res[2].toString()).dividedBy('1e18');

  const borrowIndex = borrowIndexEnd.minus(borrowIndexStart);
  const supplyIndex = supplyIndexEnd.minus(supplyIndexStart);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardOracleId });
  const supplyReward = supplyIndex.times(rewardPrice).times(365).dividedBy(tokenPrice).div('1e18');
  const borrowReward = borrowIndex.times(rewardPrice).times(365).dividedBy(tokenPrice).div('1e18');

  let lsApr = 0;
  if (pool.lsUrl) {
    try {
      const response = await fetch(pool.lsUrl).then(res => res.json());
      lsApr = response.data.smaApr / 100;
    } catch (e) {
      console.error(`Exactly: Liquid Staking URL Fetch Error ${pool.name}`);
    }
  }

  return { supplyBase, supplyReward, borrowBase, borrowReward, lsApr };
};

const getLeveragedApys = (supplyBase, borrowBase, supplyReward, borrowReward, ltv) => {
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
