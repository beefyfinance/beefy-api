import { getApyBreakdown } from '../common/getApyBreakdownNew';
import BigNumber from 'bignumber.js';

const pools = require('../../../data/ethereum/convexPools.json').filter(p => p.stakeDao);

export const getStakeDaoApys = async () => {
  let apys = [];
  try {
    const res = await fetch('https://api.stakedao.org/api/strategies/v2/curve/1.json').then(res =>
      res.json()
    );
    apys = pools.map(p => {
      const apy = res.find(r => r.lpToken?.address?.toLowerCase() === (p.token || p.pool).toLowerCase());
      const trading = new BigNumber(apy?.tradingApy || 0).div(100);
      const vault = new BigNumber(apy?.apr?.current?.total || 0).div(100).minus(trading);
      return { vault, trading };
    });
  } catch (e) {
    console.error('StakeDao json apy error', e.message);
  }
  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name.replace('curve-', 'stakedao-').replace('convex-', 'stakedao-'),
      vault: apys[i].vault,
      trading: apys[i].trading,
    }))
  );
};
