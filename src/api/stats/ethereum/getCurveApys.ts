import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import ICrv from '../../../abis/ethereum/ICrv.ts';
import ICurveGaugeController from '../../../abis/ethereum/ICurveGaugeController.ts';
import ICurveGauge from '../../../abis/ICurveGauge.ts';
import { ETH_CHAIN_ID } from '../../../constants.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';
import { fetchContract } from '../../rpc/client.ts';
import { getCurveVolumeApys } from '../common/curve/getCurveApyData.ts';
import type { CurveApyPool, CurveApyReward } from '../common/curve/getCurveApysCommon.ts';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';

const crv = '0xD533a949740bb3306d119CC777fa900bA034cd52';
const gaugeController = '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB';
const secondsPerYear = 31536000;
const volumeUrl = 'https://api.curve.finance/api/getVolumes/ethereum';

import lpPools from '../../../data/ethereum/convexPools.json' with { type: 'json' };

type CurveExtraRewardInfo = {
  pool: string;
  token: string;
};

type CurveGaugeRewardData = readonly [Address, bigint, bigint, bigint, bigint];

const pools = lpPools.filter(p => p.gauge && !p.rewardPool);

export const getCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([getCurveVolumeApys(lpPools, volumeUrl), getPoolApys(pools)]);
  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, trading: baseApys[p.name], vault: farmApys[i] })));
};

const getPoolApys = async (pools: CurveApyPool[]) => {
  const apys = [];

  const totalSupplyCalls: Promise<bigint>[] = [];
  const workingCalls: Promise<bigint>[] = [];
  const extraInfo: CurveExtraRewardInfo[] = [];
  const extraRewardDataCalls: Promise<CurveGaugeRewardData>[] = [];
  const weightCalls: Promise<bigint>[] = [];
  pools.forEach(pool => {
    // FIXME(unsafe-cast): checked previously; add typeguard
    const gauge = fetchContract(pool.gauge as string, ICurveGauge, ETH_CHAIN_ID);
    totalSupplyCalls.push(gauge.read.totalSupply());
    workingCalls.push(gauge.read.working_supply());
    pool.rewards?.forEach(reward => {
      extraInfo.push({ pool: pool.name, token: reward.token });
      extraRewardDataCalls.push(gauge.read.reward_data([reward.token as Address]));
    });
    const controller = fetchContract(gaugeController, ICurveGaugeController, ETH_CHAIN_ID);
    // FIXME(unsafe-cast): checked previously; add typeguard
    weightCalls.push(controller.read.gauge_relative_weight([pool.gauge as Address]));
  });
  const inflationRateCall = fetchContract(crv, ICrv, ETH_CHAIN_ID)
    .read.rate()
    .then(v => new BigNumber(v));
  const res = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(workingCalls),
    Promise.all(extraRewardDataCalls),
    Promise.all(weightCalls),
    inflationRateCall,
  ]);
  const poolInfo = res[0].map((_, i) => ({
    rewardRate: res[4].times(res[3][i]).div('1e18'),
    totalSupply: new BigNumber(res[0][i]),
    workingSupply: new BigNumber(res[1][i]),
  }));
  const extras = extraInfo.map((_, i) => ({
    ...extraInfo[i],
    periodFinish: new BigNumber(res[2][i][2]),
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
      if (extra.periodFinish.lt(Date.now() / 1000)) continue;
      // FIXME(unsafe-cast): checked previously; add typeguard
      const poolExtra = pool.rewards?.find(e => e.token === extra.token) as CurveApyReward;
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate
        .times(secondsPerYear)
        .times(price)
        .times('1e18')
        .div(poolExtra.decimals || '1e18');
      rewardsInUsd = rewardsInUsd.plus(extraRewardsInUsd);

      // console.log(pool.name, poolExtra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = rewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);

    // console.log(pool.name, apy.valueOf());
  }

  return apys;
};
