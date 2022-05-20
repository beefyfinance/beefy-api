const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const ICurvePool = require('../../../../abis/ICurvePool.json');
const EllipsisOracle = require('../../../../abis/EllipsisOracle.json');
const pools = require('../../../../data/ellipsisPools.json');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const DECIMALS = '1e18';

const getEllipsisPricesOld = async () => {
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
  const lpContract = getContractWithProvider(ICurvePool, pool.address, web3);
  const virtualPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());

  let price = new BigNumber(1);
  if (pool.poolOracle) {
    const oracle = getContractWithProvider(EllipsisOracle, pool.poolOracle, web3);
    const answer = await oracle.methods.latestAnswer().call();
    price = new BigNumber(answer).dividedBy(pool.poolOracleDecimals);
  }
  const tokenPrice = Number(virtualPrice.multipliedBy(price).dividedBy(DECIMALS).toFixed(6));
  return { [pool.name]: tokenPrice };
};

module.exports = getEllipsisPricesOld;
