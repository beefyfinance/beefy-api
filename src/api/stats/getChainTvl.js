import { ChainId } from '../../../packages/address-book/address-book';
const BigNumber = require('bignumber.js');
const fetchPrice = require('../../utils/fetchPrice');
const { EXCLUDED_IDS_FROM_TVL } = require('../../constants');
const { fetchContract } = require('../rpc/client');
const { default: BeefyVaultV6Abi } = require('../../abis/BeefyVault');
const { default: ERC20Abi } = require('../../abis/ERC20Abi');
import { getSingleChainVaults, getSingleChainGovVaults, getVaultByID } from './getMultichainVaults';

const getChainTvl = async chain => {
  const apiChain = ChainId[chain.chainId];
  const chainId = chain.chainId;

  const lpVaults = getSingleChainVaults(apiChain);

  const govVaults = getSingleChainGovVaults(apiChain);

  const vaultBalances = await getVaultBalances(chainId, lpVaults);

  const govVaultBalances = await getGovVaultBalances(chainId, govVaults);

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

  for (let i = 0; i < govVaults.length; i++) {
    const govVault = govVaults[i];

    let tokenPrice = 0;
    const { oracle, oracleId, tokenDecimals, excluded } = govVault;
    try {
      tokenPrice = await fetchPrice({ oracle: oracle, id: oracleId });
      // tokenPrice = 25;
    } catch (e) {
      console.error('getGovernanceTvl fetchPrice', chainId, oracle, oracleId, e);
    }

    let balance = govVaultBalances[i].shiftedBy(-tokenDecimals);
    let excludedTvl = new BigNumber(0);

    if (excluded) {
      const vault = getVaultByID(excluded);
      if (vault && vault.status === 'active') {
        excludedTvl = new BigNumber(tvls[chainId][excluded] || 0);
      }
    }
    const tvl = balance.times(tokenPrice);

    let item = { [govVault.id]: 0 };

    if (!tvl.isNaN()) {
      item = { [govVault.id]: Number(tvl.minus(excludedTvl).toFixed(2)) };
    }

    tvls[chainId] = { ...tvls[chainId], ...item };
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

const getGovVaultBalances = async (chainId, govPools) => {
  const calls = govPools.map(vault => {
    const tokenContract = fetchContract(vault.tokenAddress, ERC20Abi, chainId);
    return tokenContract.read.balanceOf([vault.earnContractAddress]);
  });

  const res = await Promise.all(calls);
  return res.map(v => new BigNumber(v.toString()));
};

module.exports = getChainTvl;
