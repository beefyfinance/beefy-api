const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const LPAbi = require('../../../abis/Snob3LP.json');
const pools = require('../../../data/avax/gondolaPools.json');

const DECIMALS = '1e18';

const getGondolaPrices = async tokenPrices => {
  const swapPools = pools.filter(pool => pool.swap !== undefined);

  let prices = {};
  let promises = [];
  swapPools.forEach(pool => promises.push(getPrice(pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (pool, tokenPrices) => {
  const swap = pool.swap;
  const lpContract = new web3.eth.Contract(LPAbi, swap.address);
  const virtualPrice = new BigNumber(await lpContract.methods.getVirtualPrice().call());

  let tokenPrice = 1;
  const tokenSymbol = swap.oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  tokenPrice = Number(virtualPrice.dividedBy(DECIMALS).multipliedBy(tokenPrice).toFixed(6));

  return { [pool.name]: tokenPrice };
};

module.exports = getGondolaPrices;
