import { GNOSIS_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById } from '../../../types/prices.ts';
import getBalancerPrices from '../common/balancer/getBalancerPrices.ts';
import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices.ts';
import auraPools from '../../../data/gnosis/auraPools.json' with { type: 'json' };
import balancerV3Pools from '../../../data/gnosis/balancerV3Pools.json' with { type: 'json' };

const pools = [...auraPools];
const v3Pools = [...balancerV3Pools];

const getBalancerGnosisPrices = async (tokenPrices: PricesById) => {
  const data = await getBalancerPrices(chainId, pools, tokenPrices);
  const dataV3 = await getBalancerV3Prices(chainId, v3Pools, tokenPrices);

  return { ...data, ...dataV3 };
};

export default getBalancerGnosisPrices;
