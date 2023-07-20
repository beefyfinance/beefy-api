import BigNumber from 'bignumber.js';
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/moonriver/solarbeamStablePools.json';
import { fetchContract } from '../../rpc/client';
import ISolarStablePool from '../../../abis/moonriver/ISolarStablePool';

const DECIMALS = '1e18';

const getSolarbeamPrices = async tokenPrices => {
  let prices = {};

  const virtualPrices = await getVirtualPrice();

  for (let i = 0; i < pools.length; i++) {
    const tokenPrice = getTokenPrice(tokenPrices, pools[i].virtualOracleId);
    const price = virtualPrices[i].multipliedBy(tokenPrice).dividedBy(DECIMALS).toNumber();
    prices = { ...prices, [pools[i].name]: price };
  }

  return prices;
};

const getVirtualPrice = async () => {
  const virtualPriceCalls = pools.map(pool => {
    const lpContract = fetchContract(pool.pool, ISolarStablePool, chainId);
    return lpContract.read.getVirtualPrice();
  });

  const res = await Promise.all(virtualPriceCalls);

  return res.map(v => new BigNumber(v.toString()));
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

export default getSolarbeamPrices;
