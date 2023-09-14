import ICurveGauge from '../../../../abis/ICurveGauge';
import { fetchContract } from '../../../rpc/client';

const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../../utils/fetchPrice');
const secondsPerYear = 31536000;

export async function getCurveApysCommon(chainId, pools) {
  const apys = [];

  const weekEpoch = Math.floor(Date.now() / 1000 / (86400 * 7));
  const rewardCalls = [],
    totalSupplyCalls = [],
    workingSupplyCalls = [],
    extraCalls = [],
    extraData = [];
  pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
    rewardCalls.push(gauge.read.inflation_rate([weekEpoch]));
    totalSupplyCalls.push(gauge.read.totalSupply());
    workingSupplyCalls.push(gauge.read.working_supply());
    pool.rewards?.forEach(reward => {
      extraCalls.push(gauge.read.reward_data([reward.token]));
      extraData.push({ pool: pool.name, token: reward.token });
    });
  });
  const [rewardResults, totalSupplyResults, workingSupplyResults, extraResults] = await Promise.all(
    [
      Promise.all(rewardCalls),
      Promise.all(totalSupplyCalls),
      Promise.all(workingSupplyCalls),
      Promise.all(extraCalls),
    ]
  );

  const poolInfo = rewardResults.map((_, i) => ({
    rewardRate: new BigNumber(rewardResults[i].toString()),
    totalSupply: new BigNumber(totalSupplyResults[i].toString()),
    workingSupply: new BigNumber(workingSupplyResults[i].toString()),
  }));

  const extras = extraResults.map((_, i) => ({
    ...extraData[i],
    periodFinish: Number(extraResults[i][1]),
    rewardRate: new BigNumber(extraResults[i][2].toString()),
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
}
