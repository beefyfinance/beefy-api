const BigNumber = require('bignumber.js');
const { default: ERC20Abi } = require('../../../../abis/ERC20Abi');
const { default: IBalancerVault } = require('../../../../abis/IBalancerVault');
const { fetchContract } = require('../../../rpc/client');

const getBalancerPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  const { tokenAddresses, balances, totalSupplys } = await getPoolsData(chainId, pools);
  for (let i = 0; i < pools.length; i++) {
    let price = await getPoolPrice(
      pools[i],
      tokenAddresses[i],
      balances[i],
      totalSupplys[i],
      tokenPrices
    );
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
  const [balanceResults, supplyResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(totalSupplyCalls),
  ]);
  const tokenAddresses = balanceResults.map(v => v[0]);
  const balances = balanceResults.map(v => {
    return v[1].map(v2 => new BigNumber(v2.toString()));
  });
  const totalSupplys = supplyResults.map(v => new BigNumber(v.toString()));

  return { tokenAddresses, balances, totalSupplys };
};

const getPoolPrice = async (pool, tokenAddresses, balance, totalSupply, tokenPrices) => {
  let tokenPrice;
  let tokenBalInUsd = new BigNumber(0);
  let totalStakedinUsd = new BigNumber(0);
  let shiftedBalances = [];
  let tokens = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    if (pool.composable) {
      if (i != pool.bptIndex) {
        tokenPrice = await getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
        tokenBalInUsd = balance[i].times(tokenPrice).dividedBy(pool.tokens[i].decimals);
        totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
        shiftedBalances.push(balance[i].dividedBy(pool.tokens[i].decimals).toString(10));
        tokens.push(tokenAddresses[i]);
      }
    } else {
      tokenPrice = await getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
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
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getBalancerPrices;
