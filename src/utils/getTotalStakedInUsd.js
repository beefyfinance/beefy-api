const BigNumber = require('bignumber.js');
const web3 = require('./web3');

const ERC20 = require('../abis/ERC20.json');
const { getPrice } = require('./getPrice');
const { lpTokenPrice } = require('./lpTokens');

const getTotalStakedInUsd = async (targetAddr, tokenAddr, oracle, oracleoId, decimals = '1e18') => {
  const tokenContract = await new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await getPrice(oracle, oracleoId);
  return totalStaked.times(tokenPrice).dividedBy(decimals);
};

const getTotalLpStakedInUsd = async (targetAddr, pool) => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await lpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = { getTotalStakedInUsd, getTotalLpStakedInUsd };
