const BigNumber = require('bignumber.js');

const LPAbi = require('../../../abis/IStableSwap.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const getStableSwapPrices = async (web3, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(web3, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (web3, pool, tokenPrices) => {
  const lpContract = getContractWithProvider(LPAbi, pool.pool, web3);
  const virtualPrice = new BigNumber(await lpContract.methods.getVirtualPrice().call());
  const tokenPrice = getTokenPrice(tokenPrices, pool.virtualOracleId);
  const price = virtualPrice.multipliedBy(tokenPrice).dividedBy(pool.decimals).toNumber();

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

module.exports = getStableSwapPrices;
