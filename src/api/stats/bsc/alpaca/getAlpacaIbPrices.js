const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const AlpacaIbVault = require('../../../../abis/AlpacaIbVault.json');
const pools = require('../../../../data/alpacaPools.json');

const getAlpacaIbPrices = async tokenPrices => {
  let prices = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolPrice(pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPoolPrice = async (pool, tokenPrices) => {
  const ibToken = new web3.eth.Contract(AlpacaIbVault, pool.address);
  const [totalToken, totalSupply] = await Promise.all([
    ibToken.methods.totalToken().call(),
    ibToken.methods.totalSupply().call(),
  ]);
  const pricePerShare = new BigNumber(totalToken).dividedBy(new BigNumber(totalSupply));

  let tokenPrice = 1;
  const tokenSymbol = pool.oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  tokenPrice = Number(pricePerShare.multipliedBy(tokenPrice).toFixed(6));
  return { [pool.name]: tokenPrice };
};

module.exports = getAlpacaIbPrices;
