const BigNumber = require('bignumber.js');
const { default: LPPairABI } = require('../abis/LPPair');
const { fetchContract } = require('../api/rpc/client');

const lpTokenRatio = async (lpTokenAddress, decimals0, decimals1, chainId = 56) => {
  const tokenPairContract = fetchContract(lpTokenAddress, LPPairABI, chainId);

  const [_reserve0, _reserve1, ...rest] = await tokenPairContract.read.getReserves();
  const reserve0 = new BigNumber(_reserve0.toString());
  const reserve1 = new BigNumber(_reserve1.toString());

  const ratio = reserve0.div(decimals0).div(reserve1.div(decimals1));

  return Number(ratio);
};

module.exports = { lpTokenRatio };
