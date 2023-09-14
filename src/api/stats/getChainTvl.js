const BigNumber = require('bignumber.js');
const getVaults = require('../../utils/getVaults.js');
const fetchPrice = require('../../utils/fetchPrice');
const { EXCLUDED_IDS_FROM_TVL } = require('../../constants');
const { getTotalStakedInUsd } = require('../../utils/getTotalStakedInUsd');
const { fetchContract } = require('../rpc/client');
const { default: BeefyVaultV6Abi } = require('../../abis/BeefyVault');

const getChainTvl = async chain => {
  const chainId = chain.chainId;

  let vaults = await getVaults(chain.vaultsEndpoint);
  const lpvaults = vaults.filter(vault => !vault.isGovVault);
  const govVaults = vaults.filter(vault => vault.isGovVault);
  const vaultBalances = await getVaultBalances(chainId, lpvaults);

  let tvls = { [chainId]: {} };
  for (let i = 0; i < lpvaults.length; i++) {
    const vault = lpvaults[i];

    if (EXCLUDED_IDS_FROM_TVL.includes(vault.id)) {
      console.warn('Excluding', vault.id, 'from tvl');
      continue;
    }

    const vaultBal = vaultBalances[i];
    let tokenPrice = 0;
    try {
      // tokenPrice = 15.5;
      tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
    } catch (e) {
      console.error('getTvl fetchPrice', chainId, vault.oracle, vault.oracleId, e);
    }
    const tvl = vaultBal.times(tokenPrice).shiftedBy(-(vault.tokenDecimals ?? 18));

    let item = { [vault.id]: 0 };
    if (!tvl.isNaN()) {
      item = { [vault.id]: Number(tvl.toFixed(2)) };
    }

    tvls[chainId] = { ...tvls[chainId], ...item };
  }

  if (govVaults.length > 0) {
    for (const govVault of govVaults) {
      const governancePoolTvl = getGovernanceTvl(chainId, govVault, tvls);
      console.log(governancePoolTvl);
      tvls[chaind] = { ...tvls[chainId], [govVault.id]: Number(governancePoolTvl.toFixed(2)) };
    }
  }

  return tvls;
};

const getVaultBalances = async (chainId, vaults) => {
  const calls = vaults.map(vault => {
    const contract = fetchContract(vault.earnedTokenAddress, BeefyVaultV6Abi, chainId);
    return contract.read.balance();
  });
  const res = await Promise.all(calls);
  return res.map(v => new BigNumber(v.toString()));
};

//Fetches chain's governance pool tvl excluding vaults already depositing in it
// to as to not count twice. (Ex: Maxi deposits in gov pool so shouldn't be counted
// twice per chain)
const getGovernanceTvl = async (chainId, govPool, tvls) => {
  try {
    tokenPrice = await fetchPrice({ oracle: governancePool.oracle, id: governancePool.oracleId });
    // tokenPrice = 25;
  } catch (e) {
    console.error(
      'getGovernanceTvl fetchPrice',
      chainId,
      governancePool.oracle,
      governancePool.oracleId,
      e
    );
  }

  let excludedTvl = 0;

  if (govPool.excluded) {
    console.log(govPool.excluded);
    console.log(tvls[chainId][govPool.excluded]);
    excludedTvl = new BigNumber(tvls[chainId][govPool.excluded]);
  }

  let totalStaked = await getTotalStakedInUsd(
    governancePool.address,
    governancePool.tokenAddress,
    governancePool.oracle,
    governancePool.oracleId,
    governancePool.tokenDecimals,
    chainId
  );

  return totalStaked.minus(excludedTvl);
};

module.exports = getChainTvl;
