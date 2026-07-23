import { BigNumber } from 'bignumber.js';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import { default as IBalancerVault } from '../../../../abis/IBalancerVault.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', platform: 'balancer' });

const getBalancerPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  const { tokenAddresses, balances, totalSupplys } = await getPoolsData(chainId, pools);
  for (let i = 0; i < pools.length; i++) {
    const price = getPoolPrice(pools[i], tokenAddresses[i], balances[i], totalSupplys[i], tokenPrices);
    prices = { ...prices, ...price };
  }

  return prices;
};

const getPoolsData = async (chainId, pools) => {
  const totalSupplyCalls = pools.map(pool => {
    const contract = fetchContract(pool.address, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });
  const balanceCalls = pools.map(pool => {
    const contract = fetchContract(pool.vault, IBalancerVault, chainId);
    return contract.read.getPoolTokens([pool.vaultPoolId]);
  });
  const [balanceResults, supplyResults] = await Promise.all([Promise.all(balanceCalls), Promise.all(totalSupplyCalls)]);
  const tokenAddresses = balanceResults.map(v => v[0]);
  const balances = balanceResults.map(v => {
    return v[1].map(v2 => new BigNumber(v2.toString()));
  });
  const totalSupplys = supplyResults.map(v => new BigNumber(v.toString()));

  return { tokenAddresses, balances, totalSupplys };
};

const getPoolPrice = (pool, tokenAddresses, balance, totalSupply, tokenPrices) => {
  let tokenPrice;
  let tokenBalInUsd = new BigNumber(0);
  let totalStakedinUsd = new BigNumber(0);
  let shiftedBalances = [];
  let tokens = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    if (!pool.composable || i != pool.bptIndex) {
      tokenPrice = getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
      tokenBalInUsd = balance[i].times(tokenPrice).dividedBy(pool.tokens[i].decimals);
      totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
      shiftedBalances.push(balance[i].dividedBy(pool.tokens[i].decimals).toString(10));
      tokens.push(tokenAddresses[i]);
    }
  }
  if (pool.composable) {
    totalSupply = totalSupply.minus(balance[pool.bptIndex]);
  }
  const price = totalStakedinUsd.times(pool.decimals).dividedBy(totalSupply).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: tokens,
      balances: shiftedBalances,
      totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
    },
  };
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn({ token: tokenSymbol }, 'unknown token, consider adding it to .json file');
  }
  return tokenPrice;
};

export default getBalancerPrices;
