const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');

const IBalancerVault = require('../../../abis/IBalancerVault.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getContract } = require('../../../utils/contractHelper');

const getBalancerPrices = async (web3, chainId, pools, tokenPrices) => {
  let prices = {};
  const { tokenAddresses, balances, totalSupplys } = await getPoolsData(web3, chainId, pools);
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

const getPoolsData = async (web3, chainId, pools) => {
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const totalSupplyCalls = [];
  const balanceCalls = [];
  pools.forEach(pool => {
    const balancerVault = getContract(IBalancerVault, pool.vault);
    const weightedPool = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: balancerVault.methods.getPoolTokens(pool.vaultPoolId),
    });
    totalSupplyCalls.push({
      totalSupply: weightedPool.methods.totalSupply(),
    });
  });

  const res = await multicall.all([balanceCalls, totalSupplyCalls]);

  const tokenAddresses = res[0].map(v => v.balance['0']);
  const balances = res[0].map(v => v.balance['1']);
  const totalSupplys = res[1].map(v => new BigNumber(v.totalSupply));
  return { tokenAddresses, balances, totalSupplys };
};

const getPoolPrice = async (pool, tokenAddresses, balance, totalSupply, tokenPrices) => {
  let tokenPrice;
  let tokenBalInUsd = new BigNumber(0);
  let totalStakedinUsd = new BigNumber(0);
  for (let i = 0; i < pool.tokens.length; i++) {
    tokenPrice = await getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
    tokenBalInUsd = new BigNumber(balance[i]).times(tokenPrice).dividedBy(pool.tokens[i].decimals);
    totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
  }
  const price = totalStakedinUsd.times(pool.decimals).dividedBy(totalSupply).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: tokenAddresses,
      balances: balance,
      totalSupply: totalSupply.shiftedBy(-18).toNumber(),
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
