const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const BeltLP = require('../../../abis/BeltLP.json');

const lp = '0x160CAed03795365F3A589f10C379FfA7d75d4E76';
const DECIMALS = '1e18';

const getEllipsis3PoolPrice = async () => {
  const lpContract = new web3.eth.Contract(BeltLP, lp);
  let tokenPrice = new BigNumber(await lpContract.methods.get_virtual_price().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'ellipsis-3eps': tokenPrice };
};

module.exports = getEllipsis3PoolPrice;