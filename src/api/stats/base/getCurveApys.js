import { BASE_CHAIN_ID as chainId } from '../../../constants.ts';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData.js';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon.js';
import { getStakeDaoV2Apys } from '../common/curve/getStakeDaoV2Apys.js';
import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import curvePoolsData from '../../../data/base/curvePools.json' with { type: 'json' };

const pools = curvePoolsData.filter(p => p.gauge);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/base';

export const getCurveApys = async () => {
  const [baseApys, curveApys, stakeDaoApys] = await Promise.all([
    getCurveSubgraphApys(pools, subgraphApyUrl),
    getCurveApysCommon(chainId, pools),
    getStakeDaoV2Apys(chainId, pools),
  ]);

  return getApyBreakdown([
    ...pools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] })),
    ...pools.map((p, i) => ({
      vaultId: p.name.replace('curve-', 'stakedao-'),
      vault: stakeDaoApys[i],
      trading: baseApys[p.name],
    })),
  ]);
};
