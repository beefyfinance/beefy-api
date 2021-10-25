const BigNumber = require('bignumber.js');

const ICurvePool = require('../../../../abis/ICurvePool.json');
const ERC20 = require('../../../../abis/ERC20.json');

const DECIMALS = '1e18';

const getCurvePricesCommon = async (web3, pools, tokenPrices) => {
  let prices = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(web3, pools, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (web3, pools, pool, tokenPrices) => {
  let price;
  if (pool.volatile) {
    price = await getVolatilePoolPrice(web3, pools, pool, tokenPrices);
  } else {
    price = await getStablePoolPrice(web3, pool, tokenPrices);
  }
  return { [pool.name]: price };
};

const getStablePoolPrice = async (web3, pool, tokenPrices) => {
  const lpContract = new web3.eth.Contract(ICurvePool, pool.pool);
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
  promises.push(new web3.eth.Contract(ERC20, pool.token).methods.totalSupply().call());
  const results = await Promise.all(promises);

  let totalBalInUsd = new BigNumber(0);
  for (let i = 0; i < pool.tokens.length; i++) {
    totalBalInUsd = totalBalInUsd.plus(results[i]);
  }
  const totalSupply = new BigNumber(results[pool.tokens.length]).dividedBy(DECIMALS);
  const price = totalBalInUsd.dividedBy(totalSupply).toNumber();
  return price;
};

const getTokenBalanceInUsd = async (web3, pools, curvePool, token, index, tokenPrices) => {
  const pool = new web3.eth.Contract(ICurvePool, curvePool);
  const balance = await pool.methods.balances(index).call();
  let price = 1;
  if (token.basePool) {
    const pool = pools.find(p => p.name === token.basePool);
    price = await getStablePoolPrice(web3, pool, tokenPrices);
  } else if (token.oracleId) {
    price = getTokenPrice(tokenPrices, token.oracleId);
  }
  return new BigNumber(balance).times(price).dividedBy(token.decimals);
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
