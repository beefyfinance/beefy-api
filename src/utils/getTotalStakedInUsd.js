const BigNumber = require('bignumber.js');
const { web3Factory } = require('./web3');

const ERC20 = require('../abis/ERC20.json');
const fetchPrice = require('./fetchPrice');
const { getContractWithProvider } = require('./contractHelper');

const getTotalStakedInUsd = async (
  targetAddr,
  tokenAddr,
  oracle,
  oracleId,
  decimals = '1e18',
  chainId = 56
) => {
  const web3 = web3Factory(chainId);

  const tokenContract = getContractWithProvider(ERC20, tokenAddr, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(targetAddr).call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(decimals);
};

const getTotalLpStakedInUsd = async (targetAddr, pool, chainId = 56) => {
  return await getTotalStakedInUsd(targetAddr, pool.address, 'lps', pool.name, '1e18', chainId);
};

module.exports = { getTotalStakedInUsd, getTotalLpStakedInUsd };
