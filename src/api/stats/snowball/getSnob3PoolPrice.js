const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const LPAbi = require('../../../abis/Snob3LP.json');

const lp = '0x6B41E5c07F2d382B921DE5C34ce8E2057d84C042';
const DECIMALS = '1e18';

const getSnob3PoolPrice = async () => {
  const lpContract = new web3.eth.Contract(LPAbi, lp);
  let tokenPrice = new BigNumber(await lpContract.methods.getVirtualPrice().call());
  tokenPrice = Number(tokenPrice.dividedBy(DECIMALS).toFixed(6));

  return { 'snob-3pool': tokenPrice };
};

module.exports = getSnob3PoolPrice;
