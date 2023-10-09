import { ETH_CHAIN_ID } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';
import ICurveGauge from '../../../abis/ICurveGauge';
import { fetchContract } from '../../rpc/client';
import ICurveGaugeController from '../../../abis/ethereum/ICurveGaugeController';
import ICrv from '../../../abis/ethereum/ICrv';

const crv = '0xD533a949740bb3306d119CC777fa900bA034cd52';
const gaugeController = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB';
const secondsPerYear = 31536000;
const tradingFees = 0.0002;
const subgraphUrl = 'https://api.curve.fi/api/getSubgraphData/ethereum';
const pools = require('../../../data/ethereum/convexPools.json').filter(
  p => p.gauge && !p.rewardPool
);

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveBaseApys(pools, subgraphUrl),
    getPoolApys(pools),
  ]);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];

  const totalSupplyCalls = [];
  const workingCalls = [];
  const extraInfo = [];
  const extraRewardDataCalls = [];
  const weightCalls = [];
  pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, ICurveGauge, ETH_CHAIN_ID);
    totalSupplyCalls.push(gauge.read.totalSupply());
    workingCalls.push(gauge.read.working_supply());
    pool.rewards?.forEach(reward => {
      extraInfo.push({ pool: pool.name, token: reward.token });
      extraRewardDataCalls.push(gauge.read.reward_data([reward.token]));
    });
    const controller = fetchContract(gaugeController, ICurveGaugeController, ETH_CHAIN_ID);
    weightCalls.push(controller.read.gauge_relative_weight([pool.gauge]));
  });
  const inflationRateCall = fetchContract(crv, ICrv, ETH_CHAIN_ID)
    .read.rate()
    .then(v => new BigNumber(v.toString()));
  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(workingCalls),
    Promise.all(extraRewardDataCalls),
    Promise.all(weightCalls),
    inflationRateCall,
  ]);
  const poolInfo = res[0].map((_, i) => ({
    rewardRate: new BigNumber(res[4].toString())
      .times(new BigNumber(res[3][i].toString()))
      .div('1e18'),
    totalSupply: new BigNumber(res[0][i].toString()),
    workingSupply: new BigNumber(res[1][i].toString()),
  }));
  const extras = extraInfo.map((_, i) => ({
    ...extraInfo[i],
    periodFinish: new BigNumber(res[2][i][2].toString()),
    rewardRate: new BigNumber(res[2][i][3]),
  }));

  const crvPrice = await fetchPrice({ oracle: 'tokens', id: 'CRV' });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = info.totalSupply.times(lpPrice);

    // boosted CRV rewards calculated based on working_supply, not totalSupply
    // but additional rewards calculated from totalSupply
    // we use totalSupply in totalStakedInUsd and increase rewards here by (* totalSupply / workingSupply)
    // so total APY can be calculated as rewardsInUsd / totalStaked
    let rewardsInUsd = info.rewardRate
      .times(secondsPerYear)
      .times(0.4)
      .times(crvPrice)
      .times(info.totalSupply)
      .div(info.workingSupply);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const poolExtra = pool.rewards.find(e => e.token === extra.token);
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price);
      rewardsInUsd = rewardsInUsd.plus(extraRewardsInUsd);

      // console.log(pool.name, poolExtra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = rewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);

    // console.log(pool.name, apy.valueOf());
  }

  return apys;
};
