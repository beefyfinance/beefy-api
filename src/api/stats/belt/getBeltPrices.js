const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const BeltLP = require('../../../abis/BeltLP.json');

const DECIMALS = '1e18';

const getBeltPrices = async () => {
  const getPrices = [
    getBeltVenusLpPrice,
    getBelt4BeltLpPrice,
  ];

  let prices = {};
  let promises = [];
  getPrices.forEach(getPrice => promises.push(getPrice()));
  const values = await Promise.all(promises);

  for (item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getBeltVenusLpPrice = async () => {
  const beltLPContract = new web3.eth.Contract(BeltLP, '0xF16D312d119c13dD27fD0dC814b0bCdcaAa62dfD');
  let tokenPrice = new BigNumber(await beltLPContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-venus-blp': tokenPrice };
};

const getBelt4BeltLpPrice = async () => {
  const beltLPContract = new web3.eth.Contract(BeltLP, '0xAEA4f7dcd172997947809CE6F12018a6D5c1E8b6');
  let tokenPrice = new BigNumber(await beltLPContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-4belt': tokenPrice };
};

module.exports = getBeltPrices;