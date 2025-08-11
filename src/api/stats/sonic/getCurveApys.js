import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getStakeDaoV2Apys } from '../common/curve/getStakeDaoV2Apys';
import { SONIC_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/sonic/curvePools.json').filter(p => p.gauge);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/sonic';

export const getCurveApys = async () => {
  const [baseApys, stakeDaoApys] = await Promise.all([
    getCurveSubgraphApys(pools, subgraphApyUrl),
    getStakeDaoV2Apys(chainId, pools),
  ]);

  return getApyBreakdown([
    ...pools.map((p, i) => ({
      vaultId: p.name.replace('curve-', 'stakedao-'),
      vault: stakeDaoApys[i],
      trading: baseApys[p.name],
    })),
  ]);
};
