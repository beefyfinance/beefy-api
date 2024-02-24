const { LINEA_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/linea/lynexStablePools.json');
const volatilePools = require('../../../data/linea/lynexVolatilePools.json');
const gammaPools = require('../../../data/linea/lynexGammaPools.json');

const pools = [...gammaPools, ...stablePools, ...volatilePools];
export const getLynexApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools.filter(p => p.gauge),
    oracleId: 'oLYNX',
    oracle: 'tokens',
    decimals: '1e18',
    boosted: false,
    reward: '0x63349BA5E1F71252eCD56E8F950D1A518B400b60',
    // log: true,
  });
};
