import { MultiCall } from 'eth-multicall';
import { ethereumWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import { getContract } from '../../../utils/contractHelper';
import ICurveGauge from '../../../abis/ICurveGauge.json';
import IGaugeController from '../../../abis/ethereum/ICurveGaugeController.json';
import ICrv from '../../../abis/ethereum/ICrv.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';

const crv = '0xD533a949740bb3306d119CC777fa900bA034cd52';
const gaugeController = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB';
const secondsPerYear = 31536000;
const tradingFees = 0.0002;
const subgraphUrl = 'https://api.curve.fi/api/getSubgraphData/ethereum';
const pools = require('../../../data/ethereum/convexPools.json').filter(
  p => p.gauge && !p.rewardPool
);

export const getCurveApys = async () => {
  const baseApys = await getCurveBaseApys(pools, subgraphUrl);
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];

  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const calls = [];
  const extraCalls = [];
  const weightCalls = [];
  pools.forEach(pool => {
    const gauge = getContract(ICurveGauge, pool.gauge);
    calls.push({
      totalSupply: gauge.methods.totalSupply(),
      workingSupply: gauge.methods.working_supply(),
    });
    pool.rewards?.forEach(reward => {
      extraCalls.push({
        pool: pool.name,
        token: reward.token,
        rewardData: gauge.methods.reward_data(reward.token),
      });
    });
    const controller = getContract(IGaugeController, gaugeController);
    weightCalls.push({
      weight: controller.methods.gauge_relative_weight(pool.gauge),
    });
  });
  const inflationRateCall = [{ rate: getContract(ICrv, crv).methods.rate() }];
  const res = await multicall.all([calls, extraCalls, weightCalls, inflationRateCall]);
  const poolInfo = res[0].map((v, i) => ({
    rewardRate: new BigNumber(res[3][0].rate).times(new BigNumber(res[2][i].weight)).div('1e18'),
    totalSupply: new BigNumber(v.totalSupply),
    workingSupply: new BigNumber(v.workingSupply),
  }));
  const extras = res[1].map(v => ({
    ...v,
    periodFinish: v.rewardData[2],
    rewardRate: new BigNumber(v.rewardData[3]),
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
