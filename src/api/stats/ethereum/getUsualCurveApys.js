import { ETH_CHAIN_ID } from '../../../constants';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import ICurveGauge from '../../../abis/ICurveGauge';
import { fetchContract } from '../../rpc/client';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';

const pools = require('../../../data/ethereum/usualCurvePools.json');
const subgraphUrl = 'https://api.curve.finance/api/getSubgraphData/ethereum';

export const getUsualCurveApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveSubgraphApys(pools, subgraphUrl),
    getPoolApys(pools),
  ]);
  return getApyBreakdown(
    pools.map((p, i) => ({ vaultId: p.name, vault: farmApys[i], trading: baseApys[p.name] }))
  );
};

const getPoolApys = async pools => {
  const apys = [];

  const [balances, rewards] = await Promise.all([
    Promise.all(pools.map(p => fetchContract(p.gauge, ICurveGauge, ETH_CHAIN_ID).read.balanceOf([p.user]))),
    Promise.all(
      pools.map(p => fetch(`https://app.usual.money/api/rewards/${p.user}`).then(res => res.json()))
    ),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = new BigNumber(balances[i]).div('1e18').times(lpPrice);

    const r = rewards[i];
    let dailyRewards = new BigNumber(0);
    if (r.length === 1) dailyRewards = new BigNumber(r[0].value);
    else if (r.length > 1) {
      dailyRewards = new BigNumber(r[r.length - 1].value).minus(new BigNumber(r[r.length - 2].value));
    }
    const usualPrice = await fetchPrice({ oracle: 'tokens', id: 'USUAL' });
    const yearlyRewardsInUsd = dailyRewards.div('1e18').times(usualPrice).times(365);
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, apy.toNumber(), totalStakedInUsd.toNumber(), dailyRewards.div('1e18').toNumber());
  }

  return apys;
};
