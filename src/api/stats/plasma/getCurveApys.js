import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon, getMerklApys } from '../common/curve/getCurveApysCommon';
import { PLASMA_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/plasma/curvePools.json').filter(p => p.gauge);
const subgraphApyUrl = 'https://api.curve.finance/api/getSubgraphData/plasma';

export const getCurveApys = async () => {
  const [baseApys, curveApys] = await Promise.all([
    // getCurveSubgraphApys(pools, subgraphApyUrl),
    {},
    getMerklApys(chainId, pools),
  ]);

  return getApyBreakdown(
    pools.map((p, i) => ({ vaultId: p.name, vault: curveApys[i], trading: baseApys[p.name] }))
  );
};
