const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const ICurvePool = require('../../../abis/ICurvePool.json');
const pools = require('../../../data/fantom/curvePools.json');

const DECIMALS = '1e18';

const getCurveFantomPrices = async () => {
  let prices = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(pool)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async pool => {
  const lpContract = new web3.eth.Contract(ICurvePool, pool.pool);
  let tokenPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { [pool.name]: tokenPrice };
};

module.exports = getCurveFantomPrices;
