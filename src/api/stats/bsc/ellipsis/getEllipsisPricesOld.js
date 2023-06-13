const BigNumber = require('bignumber.js');
const pools = require('../../../../data/ellipsisPools.json');
const { default: ICurvePool } = require('../../../../abis/ICurvePool');
const { fetchContract } = require('../../../rpc/client');
const { BSC_CHAIN_ID } = require('../../../../constants');
const { default: EllipsisOracleAbi } = require('../../../../abis/EllipsisOracle');

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
  const lpContract = fetchContract(pool.address, ICurvePool, BSC_CHAIN_ID);

  const calls = [lpContract.read.get_virtual_price()];
  let price = new BigNumber(1);
  if (pool.poolOracle) {
    const oracleContract = fetchContract(pool.poolOracle, EllipsisOracleAbi, BSC_CHAIN_ID);
    calls.push(oracleContract.read.latestAnswer());
  }
  const res = await Promise.all(calls);

  if (pool.poolOracle) {
    price = new BigNumber(res[1]).dividedBy(pool.poolOracleDecimals);
  }

  const virtualPrice = new BigNumber(res[0]);
  const tokenPrice = Number(virtualPrice.multipliedBy(price).dividedBy(DECIMALS).toFixed(6));
  return { [pool.name]: tokenPrice };
};

module.exports = getEllipsisPricesOld;
