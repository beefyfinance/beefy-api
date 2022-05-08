const BigNumber = require('bignumber.js');
const { web3Factory } = require('./web3');
const LPPair = require('../abis/LPPair.json');
const { getContract } = require('./contractHelper');

const lpTokenRatio = async (lpTokenAddress, decimals0, decimals1, chainId = 56) => {
  const web3 = web3Factory(chainId);

  const tokenPairContract = getContract(LPPair, lpTokenAddress, web3);

  let { _reserve0, _reserve1 } = await tokenPairContract.methods.getReserves().call();
  const reserve0 = new BigNumber(_reserve0);
  const reserve1 = new BigNumber(_reserve1);

  const ratio = reserve0.div(decimals0).div(reserve1.div(decimals1));

  return Number(ratio);
};

module.exports = { lpTokenRatio };
