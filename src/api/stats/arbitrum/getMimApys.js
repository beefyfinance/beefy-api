import BigNumber from 'bignumber.js';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { fetchContract } from '../../rpc/client';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import MultiFeeDistribution from '../../../abis/common/MultiFeeDistribution/MultiFeeDistribution';
import pools from '../../../data/arbitrum/mimPools.json';
import { fetchPrice } from '../../../utils/fetchPrice';

export async function getMimApys() {
  const apys = [];

  const supplyCalls = [];
  const rewardDataCalls = [];
  const rewardInfo = [];

  pools.forEach(pool => {
    const gauge = fetchContract(pool.gauge, MultiFeeDistribution, chainId);
    supplyCalls.push(gauge.read.totalSupply().then(res => new BigNumber(res.toString())));
    pool.rewards?.forEach(reward => {
      rewardDataCalls.push(gauge.read.rewardData([reward.token]));
      rewardInfo.push({ pool: pool.name, oracleId: reward.oracleId });
    });
  });

  const res = await Promise.all([Promise.all(supplyCalls), Promise.all(rewardDataCalls)]);
  const rewards = res[1].map((r, i) => ({
    periodFinish: r['1'],
    rewardRate: new BigNumber(r['2'].toString()),
    ...rewardInfo[i],
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = res[0][i].times(lpPrice).div('1e18');

    let yearlyRewardsInUsd = new BigNumber(0);
    for (const reward of rewards.filter(r => r.pool === pool.name)) {
      if (reward.periodFinish < Date.now() / 1000) continue;
      const price = await fetchPrice({ oracle: reward.oracle ?? 'tokens', id: reward.oracleId });
      const extraRewardsInUsd = reward.rewardRate.times(31536000).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
    }

    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);
  }

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: apys[i] })));
}
