const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const CurveLP = require('../../../abis/BeltLP.json');

const DECIMALS = '1e18';

const getFroyoPrices = async () => {
  const getPrices = [getFroyo3PoolPrice];

  let prices = {};
  let promises = [];
  getPrices.forEach(getPrice => promises.push(getPrice()));
  const values = await Promise.all(promises);

  for (let item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getFroyo3PoolPrice = async () => {
  const lpContract = new web3.eth.Contract(CurveLP, '0x83E5f18Da720119fF363cF63417628eB0e9fd523');
  let tokenPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'froyo-3pool': tokenPrice };
};

module.exports = getFroyoPrices;
