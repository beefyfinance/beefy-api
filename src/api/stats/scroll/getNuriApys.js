const { SCROLL_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/scroll/nuriStablePools.json');
const volatilePools = require('../../../data/scroll/nuriVolatilePools.json');

const pools = [...stablePools, ...volatilePools];
export const getNuriApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'NURI',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769',
    ramses: true,
    // log: true,
  });
};
