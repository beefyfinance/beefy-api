const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const BeltLP = require('../../../abis/BeltLP.json');

const DECIMALS = '1e18';

const getCurvePrices = async () => {
  const getPrices = [getAm3CrvPrice];

  let prices = {};
  let promises = [];
  getPrices.forEach(getPrice => promises.push(getPrice()));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getAm3CrvPrice = async () => {
  const lpContract = new web3.eth.Contract(BeltLP, '0x445FE580eF8d70FF569aB36e80c647af338db351');
  let tokenPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'curve-am3crv': tokenPrice };
};

module.exports = getCurvePrices;
