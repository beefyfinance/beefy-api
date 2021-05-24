const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const LPAbi = require('../../../../abis/Snob3LP.json');
const pools = require('../../../../data/dopplePools.json');

const DECIMALS = '1e18';

const getDopplePrices = async () => {
  const swapPools = pools.filter(pool => pool.swap !== undefined);

  let prices = {};
  let promises = [];
  swapPools.forEach(pool => promises.push(getPrice(pool)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async pool => {
  const lpContract = new web3.eth.Contract(LPAbi, pool.swap);
  let tokenPrice = new BigNumber(await lpContract.methods.getVirtualPrice().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { [pool.name]: tokenPrice };
};

module.exports = getDopplePrices;
