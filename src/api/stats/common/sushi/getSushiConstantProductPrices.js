import BigNumber from 'bignumber.js';

const ERC20 = require('../../../../abis/ERC20.json');
const ISushiConstantProductLP = require('../../../../abis/ISushiConstantProductLP.json');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const DECIMALS = '1e18';

const getSushiConstantProductPrices = async (web3, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(web3, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (web3, pool, tokenPrices) => {
  try {
    let price;
    price = await getPoolData(web3, pool, tokenPrices);
    return { [pool.name]: price };
  } catch (err) {
    console.log('error on pool ' + pool.name);
    throw err;
  }
};

const getPoolData = async (web3, pool, tokenPrices) => {
  const promises = [];
  promises.push(getContractWithProvider(ISushiConstantProductLP, pool.address, web3).methods.getNativeReserves().call());
  promises.push(getContractWithProvider(ERC20, pool.address, web3).methods.totalSupply().call());

  const results = await Promise.all(promises);

  const lp0Price = getTokenPrice(tokenPrices, pool.lp0.oracleId);
  const lp1Price = getTokenPrice(tokenPrices, pool.lp1.oracleId);
  const lp0Bal = new BigNumber(results[0]._nativeReserve0).dividedBy(pool.lp0.decimals);
  const lp1Bal = new BigNumber(results[0]._nativeReserve1).dividedBy(pool.lp1.decimals);
  const lp0BalInUsd = lp0Bal.times(lp0Price);
  const lp1BalInUsd = lp1Bal.times(lp1Price);
  const totalBalInUsd = lp0BalInUsd.plus(lp1BalInUsd);

  const totalSupply = new BigNumber(results[1]).dividedBy(DECIMALS);
  const price = totalBalInUsd.dividedBy(totalSupply).toNumber();

  // console.log(pool.name, lp0BalInUsd.valueOf(), lp1BalInUsd.valueOf(), totalBalInUsd.valueOf(), totalSupply.valueOf());

  return price;
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

module.exports = getSushiConstantProductPrices;
