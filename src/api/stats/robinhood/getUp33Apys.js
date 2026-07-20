const { ROBINHOOD_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const volatilePools = require('../../../data/robinhood/up33Pools.json');
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
