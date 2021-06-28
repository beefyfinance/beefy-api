const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const ICurvePool = require('../../../abis/ICurvePool.json');
const pools = require('../../../data/fantom/curvePools.json');

const DECIMALS = '1e18';

const getCurveFantomPrices = async tokenPrices => {
  let prices = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (pool, tokenPrices) => {
  const lpContract = new web3.eth.Contract(ICurvePool, pool.pool);
  const virtualPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  const tokenPrice = getTokenPrice(pool, tokenPrices);
  const price = Number(virtualPrice.multipliedBy(tokenPrice).dividedBy(DECIMALS).toFixed(6));

  return { [pool.name]: price };
};

const getTokenPrice = (pool, tokenPrices) => {
  if (!pool.oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = pool.oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getCurveFantomPrices;
