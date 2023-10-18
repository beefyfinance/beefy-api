import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import { getStakeDaoApyCommon } from '../common/curve/getStakeDaoApyCommon';

const pools = require('../../../data/arbitrum/curvePools.json');
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/arbitrum';
const tradingFees = 0.0002;

const stakeDaoPools = [
  {
    name: 'stakedao-arb-2crv',
    oracleId: 'curve-arb-2pool',
    gauge: '0x044f4954937316db6502638065b95E921Fd28475',
    rewards: [
      {
        token: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
        oracleId: 'CRV',
      },
      {
        token: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        oracleId: 'ARB',
      },
    ],
  },
];

export const getCurveApys = async () => {
  const curvePools = pools.filter(p => p.gauge && !p.convex);

  const [baseApys, curveApys, sdApys] = await Promise.all([
    await getCurveBaseApys(pools, baseApyUrl),
    await getCurveApysCommon(ARBITRUM_CHAIN_ID, curvePools),
    await getStakeDaoApyCommon(ARBITRUM_CHAIN_ID, stakeDaoPools),
  ]);
  const poolsMap = [
    ...curvePools.map(p => ({ name: p.name, address: p.name })),
    ...stakeDaoPools.map(p => ({ name: p.name, address: p.oracleId })),
  ];
  return getApyBreakdown(poolsMap, baseApys, [...curveApys, ...sdApys], tradingFees);
};
