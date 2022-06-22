const BigNumber = require('bignumber.js');

const ICurvePool = require('../../../../abis/ICurvePool.json');
const ERC20 = require('../../../../abis/ERC20.json');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

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
  try {
    const lpContract = getContractWithProvider(ICurvePool, pool.pool, web3);

    // Some stable pool totalSupplies can be found in the pool whilst others in the lp contract
    const supplyContract = getContractWithProvider(ERC20, pool.token ?? pool.pool, web3);

    let promises = [];
    pool.tokens.forEach((_, index) =>
      promises.push(getTokenBalanceAndAddress(web3, pool.pool, index))
    );
    promises.push(lpContract.methods.get_virtual_price().call());
    promises.push(supplyContract.methods.totalSupply().call());

    let results = [];
    results = await Promise.all(promises);

    let tokens = [];
    let balances = [];
    for (let i = 0; i < pool.tokens.length; i++) {
      tokens.push(results[i].tokenAddress);
      balances.push(
        new BigNumber(results[i].balance).dividedBy(pool.tokens[i].decimals).toString(10)
      );
    }

    const virtualPrice = new BigNumber(results[pool.tokens.length]);
    const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);
    const price = virtualPrice.multipliedBy(tokenPrice).dividedBy(DECIMALS).toNumber();

    const totalSupply = new BigNumber(results[pool.tokens.length + 1])
      .dividedBy(DECIMALS)
      .toString(10);

    return {
      price,
      tokens,
      balances,
      totalSupply,
    };
  } catch (err) {
    console.log('error on pool ' + pool.name);
    // console.log(pool);
    throw err;
  }
};

const getVolatilePoolPrice = async (web3, pools, pool, tokenPrices) => {
  const promises = [];
  pool.tokens.forEach((token, i) => {
    promises.push(getTokenDetails(web3, pools, pool.pool, token, i, tokenPrices));
  });
  promises.push(getContractWithProvider(ERC20, pool.token, web3).methods.totalSupply().call());

  const results = await Promise.all(promises);

  let totalBalInUsd = new BigNumber(0);
  let tokens = [];
  let balances = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    totalBalInUsd = totalBalInUsd.plus(results[i].usdBalance);
    tokens.push(results[i].tokenAddress);
    balances.push(
      new BigNumber(results[i].balance).dividedBy(pool.tokens[i].decimals).toString(10)
    );
  }

  const totalSupply = new BigNumber(results[pool.tokens.length]).dividedBy(DECIMALS);
  const price = totalBalInUsd.dividedBy(totalSupply).toNumber();

  if (pool.name === 'curve-poly-atricrypto3') {
    console.log('logging');
    console.log(pool);
    console.log('---');
    console.log(results);
    console.log('---');
  }

  return {
    price,
    tokens,
    balances,
    totalSupply: totalSupply.toString(10),
  };
};

const getTokenBalanceAndAddress = async (web3, curvePool, index) => {
  const pool = getContractWithProvider(ICurvePool, curvePool, web3);

  let promises = [pool.methods.balances(index).call(), pool.methods.coins(index).call()];
  let [balance, tokenAddress] = await Promise.all(promises);

  return { balance, tokenAddress };
};

const getTokenDetails = async (web3, pools, curvePool, token, index, tokenPrices) => {
  let { balance, tokenAddress } = await getTokenBalanceAndAddress(web3, curvePool, index);

  let price = 1;
  if (token.basePool) {
    const pool = pools.find(p => p.name === token.basePool);
    price = (await getStablePoolPrice(web3, pool, tokenPrices)).price;
  } else if (token.oracleId) {
    price = getTokenPrice(tokenPrices, token.oracleId);
  }

  return {
    usdBalance: new BigNumber(balance).times(price).dividedBy(token.decimals),
    balance,
    tokenAddress,
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

module.exports = getCurvePricesCommon;
