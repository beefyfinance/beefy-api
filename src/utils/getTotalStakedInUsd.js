const BigNumber = require('bignumber.js');
const fetchPrice = require('./fetchPrice');
const { fetchContract } = require('../api/rpc/client');
const { default: ERC20Abi } = require('../abis/ERC20Abi');

const getTotalStakedInUsd = async (
  targetAddr,
  tokenAddr,
  oracle,
  oracleId,
  decimals = '1e18',
  chainId = 56
) => {
  const tokenContract = fetchContract(tokenAddr, ERC20Abi, chainId);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([targetAddr])).toString());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  return totalStaked.times(tokenPrice).dividedBy(decimals);
};

const getTotalLpStakedInUsd = async (targetAddr, pool, chainId = 56) => {
  return await getTotalStakedInUsd(targetAddr, pool.address, 'lps', pool.name, '1e18', chainId);
};

module.exports = { getTotalStakedInUsd, getTotalLpStakedInUsd };
