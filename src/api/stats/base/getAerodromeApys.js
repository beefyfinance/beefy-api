const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/base/aerodromeStableLpPools.json');
const volatilePools = require('../../../data/base/aerodromeLpPools.json');

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
