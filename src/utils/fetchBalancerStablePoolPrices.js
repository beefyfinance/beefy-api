import getBalancerPrices from '../api/stats/common/getBalancerPrices';
import { web3Factory } from './web3';
import beetsPools from '../data/optimism/beethovenxSteadyBeets.json';
import bbaUSD from '../data/ethereum/bbaUSD.json';
import beetsLinearPools from '../data/optimism/beethovenxLinearPools.json';
import balancerLinearPools from '../data/ethereum/balancerLinearPools.json';

const stablePoolPools = [...beetsPools, ...bbaUSD];
const linearPoolPools = [...beetsLinearPools, ...balancerLinearPools];

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
    const web3 = web3Factory(uniqueChainIds[i]);
    let filtered = pools.filter(p => p.chainId == uniqueChainIds[i]);
    const results = await getPrice(web3, uniqueChainIds[i], filtered, tokenPrices);
    prices = { ...prices, ...results };
  }

  return prices;
};

const getPrice = async (web3, chainId, pools, tokenPrices) => {
  let prices = {};
  let results = await getBalancerPrices(web3, chainId, pools, tokenPrices);
  for (const [key, value] of Object.entries(results)) {
    let price = { [key]: value.price };
    prices = { ...prices, ...price };
  }

  return prices;
};

export { fetchBalancerStablePoolPrice, fetchBalancerLinearPoolPrice };
