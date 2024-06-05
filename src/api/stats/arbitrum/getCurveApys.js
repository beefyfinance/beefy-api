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
  {
    name: 'stakedao-arb-crvusd-usdt',
    oracleId: 'curve-arb-crvusd-usdt',
    gauge: '0x627b57Ad0A2219C44e9B5AE11Ea8802a9411433b',
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
  {
    name: 'stakedao-arb-fraxbp',
    oracleId: 'curve-arb-f-fraxbp',
    gauge: '0x9B72d53bb8EF5B42046ea6EDdDF3c95571640685',
    rewards: [
      {
        token: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
        oracleId: 'CRV',
      },
      {
        token: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        oracleId: 'ARB',
      },
      {
        token: '0x9d2f299715d94d8a7e6f5eaa8e654e8c74a988a7',
        oracleId: 'FXS',
      },
    ],
  },
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
