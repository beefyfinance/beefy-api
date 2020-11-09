const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const ERC20 = require('../abis/ERC20.json');
const { getPrice } = require('./getPrice');

const web3 = new Web3(process.env.BSC_RPC);

const getTotalStakedInUsd = async (targetAddr, tokenAddr, oracle, oracleoId, decimals = '1e18') => {
  const tokenContract = await new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await getPrice(oracle, oracleoId);
  return totalStaked.times(tokenPrice).dividedBy(decimals);
};

module.exports = getTotalStakedInUsd;
