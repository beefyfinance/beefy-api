const BigNumber = require('bignumber.js');

const ICurvePool = require('../../../../abis/ICurvePool.json');
const ERC20 = require('../../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const DECIMALS = '1e18';

const getCurvePricesCommon = async (web3, pools, tokenPrices, withBreakdown = true) => {
  let prices = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(web3, pools, pool, tokenPrices, withBreakdown)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (web3, pools, pool, tokenPrices, withBreakdown) => {
  try {
    let price;
    if (pool.volatile) {
      price = await getVolatilePoolPrice(web3, pools, pool, tokenPrices, withBreakdown);
    } else {
      price = await getStablePoolPrice(web3, pool, tokenPrices, withBreakdown);
    }

    if (withBreakdown) {
      let { tokens, balances, totalSupply } = await getLpBreakdownData(web3, pool);

      return { [pool.name]: { price, tokens, balances, totalSupply } };
    }

    return { [pool.name]: price };
  } catch (err) {
    console.log('error on pool ' + pool.name);
    throw err;
  }
};

const getLpBreakdownData = async (web3, pool) => {
  //if in some cases totalsupply is fetched from separate contract, not pool
  let supplyContract = getContractWithProvider(ERC20, pool.token ?? pool.pool, web3);

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

const getStablePoolPrice = async (web3, pool, tokenPrices, withBreakdown) => {
  const lpContract = getContractWithProvider(ICurvePool, pool.pool, web3);

  const virtualPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);
  const price = virtualPrice.multipliedBy(tokenPrice).dividedBy(DECIMALS).toNumber();

  return price;
};

const getVolatilePoolPrice = async (web3, pools, pool, tokenPrices) => {
  const promises = [];
  pool.tokens.forEach((token, i) => {
    promises.push(getTokenBalanceInUsd(web3, pools, pool.pool, token, i, tokenPrices));
  });
  promises.push(getContractWithProvider(ERC20, pool.token, web3).methods.totalSupply().call());

  const results = await Promise.all(promises);

  let totalBalInUsd = new BigNumber(0);

  for (let i = 0; i < pool.tokens.length; i++) {
    totalBalInUsd = totalBalInUsd.plus(results[i]);
  }

  const totalSupply = new BigNumber(results[pool.tokens.length]).dividedBy(DECIMALS);
  const price = totalBalInUsd.dividedBy(totalSupply).toNumber();

  return price;
};

const getTokenBalanceAndAddress = async (web3, curvePool, index) => {
  const pool = getContractWithProvider(ICurvePool, curvePool, web3);

  let promises = [pool.methods.balances(index).call(), pool.methods.coins(index).call()];
  let [balance, tokenAddress] = await Promise.all(promises);

  return { balance, tokenAddress };
};

const getTokenBalanceInUsd = async (web3, pools, curvePool, token, index, tokenPrices) => {
  const pool = getContractWithProvider(ICurvePool, curvePool, web3);
  const balance = await pool.methods.balances(index).call();

  let price = 1;
  if (token.basePool) {
    const pool = pools.find(p => p.name === token.basePool);
    price = await getStablePoolPrice(web3, pool, tokenPrices);
  } else if (token.oracleId) {
    price = getTokenPrice(tokenPrices, token.oracleId);
  }

  let usdBalance = new BigNumber(balance).times(price).dividedBy(token.decimals);
  return usdBalance;
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

module.exports = getCurvePricesCommon;
