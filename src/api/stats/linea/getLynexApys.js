import { LINEA_CHAIN_ID as chainId } from '../../../constants.ts';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys.js';
import ichiPools from '../../../data/linea/lynexIchiPools.json' with { type: 'json' };

const pools = [...ichiPools];
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
