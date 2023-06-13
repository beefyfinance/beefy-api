const BigNumber = require('bignumber.js');
const { default: IStableSwapAbi } = require('../../../abis/IStableSwap');
const { fetchContract } = require('../../rpc/client');
const { default: ERC20Abi } = require('../../../abis/ERC20Abi');

const DECIMALS = '1e18';

const getStableSwapPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(chainId, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (chainId, pool, tokenPrices) => {
  const lpContract = fetchContract(pool.pool, IStableSwapAbi, chainId);

  const virtualPrice = new BigNumber((await lpContract.read.getVirtualPrice()).toString());
  const tokenPrice = getTokenPrice(tokenPrices, pool.virtualOracleId);
  const price = virtualPrice.multipliedBy(tokenPrice).dividedBy(pool.decimals).toNumber();

  let { tokens, balances, totalSupply } = await getLpBreakdownData(chainId, pool);
  return { [pool.name]: { price, tokens, balances, totalSupply } };
};

const getLpBreakdownData = async (chainId, pool) => {
  const supplyContract = fetchContract(pool.address, ERC20Abi, chainId);

  const promises = [];
  pool.tokens.forEach((_, index) =>
    promises.push(getTokenBalanceAndAddress(chainId, pool.pool, index))
  );
  promises.push(supplyContract.read.totalSupply());

  let results = await Promise.all(promises);

  let tokens = [];
  let balances = [];

  for (let i = 0; i < pool.tokens.length; i++) {
    tokens.push(results[i].tokenAddress);
    balances.push(
      new BigNumber(results[i].balance).dividedBy(pool.tokens[i].decimals).toString(10)
    );
  }

  const totalSupply = new BigNumber(results[pool.tokens.length]).dividedBy(DECIMALS).toString(10);

  return { tokens, balances, totalSupply };
};

const getTokenBalanceAndAddress = async (chainId, stablePool, index) => {
  const pool = fetchContract(stablePool, IStableSwapAbi, chainId);

  let promises = [pool.read.getTokenBalance([index]), pool.read.getToken([index])];
  let [balance, tokenAddress] = await Promise.all(promises);

  return { balance, tokenAddress };
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

module.exports = getStableSwapPrices;
