import { BASE_CHAIN_ID as chainId }from '../../../constants.ts';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';
import stablePools from '../../../data/base/aerodromeStableLpPools.json' with { type: "json" };
import volatilePools from '../../../data/base/aerodromeLpPools.json' with { type: "json" };

const pools = [...stablePools, ...volatilePools];
export const getAerodromeApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools.filter(p => p.gauge),
    oracleId: 'AERO',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    singleReward: true,
    // log: true,
  });
};
