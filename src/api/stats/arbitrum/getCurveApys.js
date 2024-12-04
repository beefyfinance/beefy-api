import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import { getStakeDaoApyCommon } from '../common/curve/getStakeDaoApyCommon';

const pools = require('../../../data/arbitrum/curvePools.json');
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/arbitrum';
const tradingFees = 0.0002;

const stakeDaoPools = [
  {
    name: 'stakedao-arb-asdcrv',
    oracleId: 'curve-arb-asdcrv',
    gauge: '0xd038Af8545662af0625A11d15b18015fcD28B7FB',
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
    await getCurveSubgraphApys(pools, baseApyUrl),
    await getCurveApysCommon(ARBITRUM_CHAIN_ID, curvePools),
    await getStakeDaoApyCommon(ARBITRUM_CHAIN_ID, stakeDaoPools),
  ]);
  const poolsMap = [
    ...curvePools.map(p => ({ name: p.name, address: p.name })),
    ...stakeDaoPools.map(p => ({ name: p.name, address: p.oracleId })),
  ];
  return getApyBreakdown(poolsMap, baseApys, [...curveApys, ...sdApys], tradingFees);
};
