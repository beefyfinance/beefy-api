import getBalancerV3Prices from '../common/balancer/getBalancerV3Prices';
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import balancerV3Pools from '../../../data/optimism/balancerV3.json';
import auraV3Pools from '../../../data/optimism/auraV3Pools.json';

const v3Pools = [...auraV3Pools, ...balancerV3Pools];

const getBeetsOPPrices = async tokenPrices => {
  const pricesV3 = await getBalancerV3Prices(chainId, v3Pools, tokenPrices);
  return { ...pricesV3 };
};

export default getBeetsOPPrices;
