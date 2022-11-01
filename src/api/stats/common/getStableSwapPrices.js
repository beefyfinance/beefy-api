const BigNumber = require('bignumber.js');

const LPAbi = require('../../../abis/IStableSwap.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const DECIMALS = '1e18';

const getStableSwapPrices = async (web3, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(web3, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (web3, pool, tokenPrices) => {
  const lpContract = getContractWithProvider(LPAbi, pool.pool, web3);
  const virtualPrice = new BigNumber(await lpContract.methods.getVirtualPrice().call());
  const tokenPrice = getTokenPrice(tokenPrices, pool.virtualOracleId);
  const price = virtualPrice.multipliedBy(tokenPrice).dividedBy(pool.decimals).toNumber();

  let { tokens, balances, totalSupply } = await getLpBreakdownData(web3, pool);
  return { [pool.name]: { price, tokens, balances, totalSupply } };
};

const getLpBreakdownData = async (web3, pool) => {
  let supplyContract = getContractWithProvider(ERC20, pool.address, web3);

  let promises = [];
  pool.tokens.forEach((_, index) =>
    promises.push(getTokenBalanceAndAddress(web3, pool.pool, index))
  );
  promises.push(supplyContract.methods.totalSupply().call());

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

const getTokenBalanceAndAddress = async (web3, stablePool, index) => {
  const pool = getContractWithProvider(LPAbi, stablePool, web3);

  let promises = [pool.methods.getTokenBalance(index).call(), pool.methods.getToken(index).call()];
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
