const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const BeltLP = require('../../../abis/BeltLP.json');
const EllipsisOracle = require('../../../abis/EllipsisOracle.json');

const DECIMALS = '1e18';

const getEllipsisPrices = async () => {
  const getPrices = [getEllipsis3PoolPrice, getEllipsisFUsdt3PoolPrice, getEllipsisRenBtcPoolPrice];

  let prices = {};
  let promises = [];
  getPrices.forEach(getPrice => promises.push(getPrice()));
  const values = await Promise.all(promises);

  for (item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getEllipsis3PoolPrice = async () => {
  const lpContract = new web3.eth.Contract(BeltLP, '0x160CAed03795365F3A589f10C379FfA7d75d4E76');
  let tokenPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'ellipsis-3eps': tokenPrice };
};

const getEllipsisFUsdt3PoolPrice = async () => {
  const lpContract = new web3.eth.Contract(BeltLP, '0x556ea0b4c06D043806859c9490072FaadC104b63');
  let tokenPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'ellipsis-fusdt-3eps': tokenPrice };
};

const getEllipsisRenBtcPoolPrice = async () => {
  const lpContract = new web3.eth.Contract(BeltLP, '0x2477fB288c5b4118315714ad3c7Fd7CC69b00bf9');
  const virtualPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());

  const oracle = new web3.eth.Contract(
    EllipsisOracle,
    '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf'
  );
  const btcPrice = new BigNumber(await oracle.methods.latestAnswer().call()).dividedBy('1e8');

  const tokenPrice = Number(virtualPrice.multipliedBy(btcPrice).dividedBy(DECIMALS).toFixed(6));

  return { 'ellipsis-renbtc': tokenPrice };
};

module.exports = getEllipsisPrices;
