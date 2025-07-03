const { HYPEREVM_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/hyperevm/kittenswapStablePools.json');
const volatilePools = require('../../../data/hyperevm/kittenswapLpPools.json');

const pools = [...stablePools, ...volatilePools];
export const getKittenswapApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools.filter(p => p.gauge),
    oracleId: 'KITTEN',
    oracle: 'tokens',
    decimals: '1e18',
    rewardScale: '1e18',
    boosted: false,
    kitten: true,
    // log: true,
  });
};
