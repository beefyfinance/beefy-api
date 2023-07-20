import ICurvePoolAbi from '../../../abis/CurvePool';
import { BSC_CHAIN_ID } from '../../../constants';
import { fetchContract } from '../../rpc/client';
const BigNumber = require('bignumber.js');
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
  const lpContract = fetchContract(pool.minter, ICurvePoolAbi, BSC_CHAIN_ID);
  const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);

  let lpPrice = new BigNumber(1);
  try {
    if (pool.volatile) {
      lpPrice = new BigNumber(await lpContract.read.lp_price());
    } else {
      lpPrice = new BigNumber(await lpContract.read.get_virtual_price());
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
