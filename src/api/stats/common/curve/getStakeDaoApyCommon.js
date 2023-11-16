import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../../utils/fetchPrice';
import ICurveGauge from '../../../../abis/ICurveGauge';
import { fetchContract } from '../../../rpc/client';

const secondsPerYear = 31536000;

export const getStakeDaoApyCommon = async (chainId, pools) => {
  const apys = [];

  const totalSupplyCalls = [],
    extraCalls = [],
    extraData = [];
  pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, ICurveGauge, chainId);
    totalSupplyCalls.push(gauge.read.totalSupply());
    pool.rewards?.forEach(reward => {
      extraCalls.push(gauge.read.reward_data([reward.token]));
      extraData.push({ pool: pool.name, token: reward.token });
    });
  });
  const [totalSupplyResults, extraResults] = await Promise.all([
    Promise.all(totalSupplyCalls),
    Promise.all(extraCalls),
  ]);

  const totalSupplies = totalSupplyResults.map(r => new BigNumber(r.toString()));

  const extras = extraResults.map((_, i) => ({
    ...extraData[i],
    periodFinish: Number(extraResults[i][2]),
    rewardRate: new BigNumber(extraResults[i][3].toString()),
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const totalSupply = totalSupplies[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.oracleId });
    const totalStakedInUsd = totalSupply.times(lpPrice);

    let rewardsInUsd = new BigNumber(0);
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
};
