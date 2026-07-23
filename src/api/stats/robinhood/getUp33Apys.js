import { ROBINHOOD_CHAIN_ID as chainId } from '../../../constants.ts';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';
import volatilePools from '../../../data/robinhood/up33Pools.json' with { type: 'json' };

const stablePools = [];

const pools = [...stablePools, ...volatilePools];
export const getUp33Apys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools.filter(p => p.gauge),
    oracleId: 'UP33',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    singleReward: true,
    // log: true,
  });
};
