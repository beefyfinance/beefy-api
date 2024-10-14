import getBalancerPrices from '../api/stats/common/balancer/getBalancerPrices';
import bbaUSD from '../data/ethereum/bbaUSD.json';
import bbamUSD from '../data/matic/bbamUSD.json';
import bbaaUSD from '../data/arbitrum/bbaaUSD.json';
import beetsLinearPools from '../data/optimism/beethovenxLinearPools.json';
import balancerLinearPools from '../data/ethereum/balancerLinearPools.json';
import balancerPolyLinearPools from '../data/matic/balancerLinearPools.json';
import balancerArbLinearPools from '../data/arbitrum/balancerLinearPools.json';
import balancerBaseLinearPools from '../data/base/balancerLinearPools.json';

const stablePoolPools = [...bbaUSD, ...bbamUSD, ...bbaaUSD];
const linearPoolPools = [
  ...beetsLinearPools,
  ...balancerLinearPools,
  ...balancerPolyLinearPools,
  ...balancerArbLinearPools,
  ...balancerBaseLinearPools,
];

const fetchBalancerStablePoolPrice = async tokenPrices => {
  let prices = {};
  const results = await fetchPoolPrice(tokenPrices, stablePoolPools);

  return { ...prices, ...results };
};

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

export { fetchBalancerStablePoolPrice, fetchBalancerLinearPoolPrice };
