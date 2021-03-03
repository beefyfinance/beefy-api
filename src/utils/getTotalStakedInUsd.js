const BigNumber = require('bignumber.js');
const { bscWeb3: web3, web3Factory } = require('./web3');

const ERC20 = require('../abis/ERC20.json');
const fetchPrice = require('./fetchPrice');
const { lpTokenPrice } = require('./lpTokens');

const getTotalStakedInUsd = async (
  targetAddr,
  tokenAddr,
  oracle,
  oracleId,
  decimals = '1e18',
  chainId = 56
) => {
  const web3 = web3Factory(chainId);

  const tokenContract = new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(decimals);
};

const getTotalLpStakedInUsd = async (targetAddr, pool, chainId = 56) => {
  const web3 = web3Factory(chainId);

  const tokenPairContract = new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await lpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = { getTotalStakedInUsd, getTotalLpStakedInUsd };
