import getBalancerPrices from '../api/stats/common/balancer/getBalancerPrices';
import beetsLinearPools from '../data/optimism/beethovenxLinearPools.json';
import balancerLinearPools from '../data/ethereum/balancerLinearPools.json';
import balancerPolyLinearPools from '../data/matic/balancerLinearPools.json';
import balancerArbLinearPools from '../data/arbitrum/balancerLinearPools.json';

const linearPoolPools = [
  ...beetsLinearPools,
  ...balancerLinearPools,
  ...balancerPolyLinearPools,
  ...balancerArbLinearPools,
];

const fetchBalancerLinearPoolPrice = async tokenPrices => {
  let prices = {};
  const results = await fetchPoolPrice(tokenPrices, linearPoolPools);

  return { ...prices, ...results };
};

const fetchPoolPrice = async (tokenPrices, pools) => {
  const chainIds = pools.map(p => p.chainId);
  const uniqueChainIds = [...new Set(chainIds)];
  let prices = {};

  for (let i = 0; i < uniqueChainIds.length; i++) {
    let filtered = pools.filter(p => p.chainId == uniqueChainIds[i]);
    const results = await getPrice(uniqueChainIds[i], filtered, tokenPrices);
    prices = { ...prices, ...results };
  }

  return prices;
};

const getPrice = async (chainId, pools, tokenPrices) => {
  let prices = {};
  let results = await getBalancerPrices(chainId, pools, tokenPrices);
  for (const [key, value] of Object.entries(results)) {
    let price = { [key]: value.price };
    prices = { ...prices, ...price };
  }

  return prices;
};

export { fetchBalancerLinearPoolPrice };
