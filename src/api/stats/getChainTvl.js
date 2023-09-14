import { ChainId } from '../../../packages/address-book/address-book';
const BigNumber = require('bignumber.js');
const fetchPrice = require('../../utils/fetchPrice');
const { EXCLUDED_IDS_FROM_TVL } = require('../../constants');
const { getTotalStakedInUsd } = require('../../utils/getTotalStakedInUsd');
const { fetchContract } = require('../rpc/client');
const { default: BeefyVaultV6Abi } = require('../../abis/BeefyVault');
import { getSingleChainVaults, getSingleChainGovVaults } from './getMultichainVaults';

const getChainTvl = async chain => {
  const apiChain = ChainId[chain.chainId];
  const chainId = chain.chainId;

  const lpVaults = getSingleChainVaults(apiChain);

  const govVaults = getSingleChainGovVaults(apiChain);

  const vaultBalances = await getVaultBalances(chainId, lpVaults);

  let tvls = { [chainId]: {} };
  for (let i = 0; i < lpVaults.length; i++) {
    const vault = lpVaults[i];

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
    tokenPrice = await fetchPrice({ oracle: govPool.oracle, id: govPool.oracleId });
    // tokenPrice = 25;
  } catch (e) {
    console.error('getGovernanceTvl fetchPrice', chainId, govPool.oracle, govPool.oracleId, e);
  }

  let excludedTvl = 0;

  if (govPool.excluded) {
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
