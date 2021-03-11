const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const BeltLP = require('../../../abis/BeltLP.json');

const beltLP = '0xF16D312d119c13dD27fD0dC814b0bCdcaAa62dfD';
const DECIMALS = '1e18';

const getBeltVenusLpPrice = async () => {
  const beltLPContract = new web3.eth.Contract(BeltLP, beltLP);
  let tokenPrice = new BigNumber(await beltLPContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'belt-venus-blp': tokenPrice };
};

module.exports = getBeltVenusLpPrice;