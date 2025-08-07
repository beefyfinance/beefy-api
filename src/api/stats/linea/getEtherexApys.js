const { LINEA_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/linea/etherexStablePools.json');
const volatilePools = require('../../../data/linea/etherexVolatilePools.json');

const pools = [...stablePools, ...volatilePools];
export const getEtherexApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'REX',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xEfD81eeC32B9A8222D1842ec3d99c7532C31e348',
    ramses: true,
    rewardScale: 1e18,
    // log: true,
  });
};
