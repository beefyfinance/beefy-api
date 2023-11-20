const BigNumber = require('bignumber.js');
import { OPTIMISM_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
import ExactlyRewardsController from '../../../abis/ExactlyRewardsController';
import ExactlyInterestRateModel from '../../../abis/ExactlyInterestRateModel';

import { fetchPrice } from '../../../utils/fetchPrice';
const { getApyBreakdown } = require('../common/getApyBreakdown');
const { getExactlyData } = require('../../../utils/getExactlyData');
const { exactlyClient } = require('../../../apollo/client');
const pools = require('../../../data/optimism/exactlyPools.json');

const RewardsController = '0xBd1ba78A3976cAB420A9203E6ef14D18C2B2E031';

const getExactlyApys = async () => {
  const rewardApys = [];
  const lendingApys = [];
  const lsApys = [];
  let promises = [];

  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);
  values.forEach(item => {
    rewardApys.push(item[0]);
    lendingApys.push(item[1]);
    lsApys.push(item[2]);
  });

  return getApyBreakdown(
    pools.map(p => ({ ...p, address: p.name })),
    Object.fromEntries(pools.map((p, i) => [p.name, lendingApys[i]])),
    rewardApys,
    0,
    lsApys
  );
};

const getPoolApy = async pool => {
  const { supplyBase, supplyReward, borrowBase, borrowReward, lsApr } = await getExactlyPoolData(
    pool
  );
  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyReward, leveragedBorrowReward } =
    getLeveragedApys(supplyBase, borrowBase, supplyReward, borrowReward, pool.ltv);

  const rewardsApy = leveragedSupplyReward.plus(leveragedBorrowReward);
  const lendingApy = leveragedSupplyBase.minus(leveragedBorrowBase);

  // console.log(pool.name, supplyBase.toString(), borrowBase.toString(), supplyReward.toString(), borrowReward.toString());
  return [rewardsApy, lendingApy, lsApr];
};

const getExactlyPoolData = async pool => {
  const { supplyBase, utilization } = await getExactlyData(exactlyClient, pool.market);

  const interestRateModel = fetchContract(
    pool.interestRateModel,
    ExactlyInterestRateModel,
    OPTIMISM_CHAIN_ID
  );

  const borrowBaseCall = interestRateModel.read.floatingRate([utilization.toString()]);
  const borrowBase = new BigNumber(await Promise.all([borrowBaseCall])).dividedBy('1e18');

  const rewardsController = fetchContract(
    RewardsController,
    ExactlyRewardsController,
    OPTIMISM_CHAIN_ID
  );

  let supplyReward = new BigNumber(0);
  let borrowReward = new BigNumber(0);
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });

  for (const reward of pool.rewards) {
    const indexStartCall = rewardsController.read.previewAllocation([
      pool.market,
      reward.address,
      0,
    ]);
    const indexEndCall = rewardsController.read.previewAllocation([
      pool.market,
      reward.address,
      86400,
    ]);

    const res = await Promise.all([indexStartCall, indexEndCall]);

    const borrowIndexStart = new BigNumber(res[0][0].toString());
    const supplyIndexStart = new BigNumber(res[0][1].toString());
    const borrowIndexEnd = new BigNumber(res[1][0].toString());
    const supplyIndexEnd = new BigNumber(res[1][1].toString());

    const borrowIndex = borrowIndexEnd.minus(borrowIndexStart);
    const supplyIndex = supplyIndexEnd.minus(supplyIndexStart);

    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: reward.id });
    const intermiateSupplyReward = supplyIndex
      .times(rewardPrice)
      .times(365)
      .dividedBy(tokenPrice)
      .dividedBy('1e18');
    const intermiateBorrowReward = borrowIndex
      .times(rewardPrice)
      .times(365)
      .dividedBy(tokenPrice)
      .dividedBy('1e18');

    supplyReward = supplyReward.plus(intermiateSupplyReward);
    borrowReward = borrowReward.plus(intermiateBorrowReward);
  }

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
