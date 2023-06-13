import BigNumber from 'bignumber.js';
import ISushiConstantProductLP from '../../../../abis/ISushiConstantProductLP';
import { fetchContract } from '../../../rpc/client';

const DECIMALS = '1e18';

const getSushiConstantProductPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(chainId, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (chainId, pool, tokenPrices) => {
  try {
    let price = {};
    price = await getPoolData(chainId, pool, tokenPrices);
    return price;
  } catch (err) {
    console.log('error on pool ' + pool.name);
    throw err;
  }
};

const getPoolData = async (chainId, pool, tokenPrices) => {
  const lpContract = fetchContract(pool.address, ISushiConstantProductLP, chainId);
  const [reserveCall, totalSupplyCall] = [
    lpContract.read.getNativeReserves(),
    lpContract.read.totalSupply(),
  ];

  const [reserveResult, supplyResult] = await Promise.all([reserveCall, totalSupplyCall]);

  const lp0Price = getTokenPrice(tokenPrices, pool.lp0.oracleId);
  const lp1Price = getTokenPrice(tokenPrices, pool.lp1.oracleId);
  const lp0Bal = new BigNumber(reserveResult[0]).dividedBy(pool.lp0.decimals);
  const lp1Bal = new BigNumber(reserveResult[1]).dividedBy(pool.lp1.decimals);
  const lp0BalInUsd = lp0Bal.times(lp0Price);
  const lp1BalInUsd = lp1Bal.times(lp1Price);
  const totalBalInUsd = lp0BalInUsd.plus(lp1BalInUsd);

  const totalSupply = new BigNumber(supplyResult).dividedBy(DECIMALS);
  const price = totalBalInUsd.dividedBy(totalSupply).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [lp0Bal.toString(10), lp1Bal.toString(10)],
      totalSupply: totalSupply.toString(10),
    },
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

module.exports = getSushiConstantProductPrices;
