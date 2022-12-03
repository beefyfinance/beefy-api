const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const ICurvePool = require('../../../abis/ICurvePool.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const pools = require('../../../data/bsc/ellipsisPools.json');

const DECIMALS = '1e18';

export const getEllipsisPrices = async tokePrices => {
  let prices = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(pool, tokePrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (pool, tokenPrices) => {
  const lpContract = getContractWithProvider(ICurvePool, pool.minter, web3);
  const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);

  let lpPrice = new BigNumber(1);
  try {
    if (pool.volatile) {
      lpPrice = new BigNumber(await lpContract.methods.lp_price().call());
    } else {
      lpPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
    }
  } catch (e) {
    console.warn('getEllipsisPrice error', pool.name);
  }

  const price = lpPrice.multipliedBy(tokenPrice).dividedBy(DECIMALS).toNumber();

  return { [pool.name]: price };
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
