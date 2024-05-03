const { LINEA_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/linea/nileStablePools.json');
const volatilePools = require('../../../data/linea/nileVolatilePools.json');

const pools = [...stablePools, ...volatilePools];
export const getNileApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'NILE',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xAAAac83751090C6ea42379626435f805DDF54DC8',
    ramses: true,
    // log: true,
  });
};
