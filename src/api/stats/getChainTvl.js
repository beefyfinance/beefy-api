import { get } from 'lodash';
import { ChainId } from '../../../packages/address-book/src/address-book';
const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../utils/fetchPrice';
import { getSingleChainCowVaults } from './getMultichainVaults';
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
  const cowVaults = getSingleChainCowVaults(apiChain);
  const vaultsCalls = [
    getVaultBalances(chainId, lpVaults),
    getGovVaultBalances(chainId, govVaults),
    getCowVaultBalances(chainId, cowVaults),
  ];
  const [vaultBalances, govVaultBalances, cowVaultBalances] = await Promise.all(vaultsCalls);

  let tvls = { [chainId]: {} };

  //first set lp vaults since some gov vaults can exlude from tvl from those
  tvls = await setVaultsTvl(lpVaults, vaultBalances, chainId, tvls);
  tvls = await setVaultsTvl(cowVaults, cowVaultBalances, chainId, tvls);
  tvls = await setVaultsTvl(govVaults, govVaultBalances, chainId, tvls);

  // separate CLM / CLM Pool / CLM Vault TVL
  for (const clm of cowVaults) {
    const clmId = clm.id;
    const clmAddress = clm.earnContractAddress;

    // TODO fix if we ever have more than one pool/vault per clm
    const clmVault = lpVaults.find(vault => vault.tokenAddress === clmAddress);
    const clmPool = govVaults.find(pool => pool.tokenAddress === clmAddress);

    const clmVaultTvl = clmVault ? tvls[chainId]?.[clmVault.id] || 0 : 0;
    const clmPoolTvl = clmPool ? tvls[chainId]?.[clmPool.id] || 0 : 0;
    const clmTvl = tvls[chainId]?.[clmId] || 0;

    // Vault deposits in to Pool
    if (clmPool && clmVault) {
      // On-chain pool TVL therefore also includes vault deposits, so remove them
      const clmPoolItem = { [clmPool.id]: Math.max(0, clmPoolTvl - clmVaultTvl) };
      tvls[chainId] = { ...tvls[chainId], ...clmPoolItem };
    }

    // Pool deposits in to CLM
    if (clmPool) {
      // On-chain CLM TVL therefore also includes pool deposits, so remove them
      const clmItem = { [clmId]: Math.max(0, clmTvl - clmPoolTvl) };
      tvls[chainId] = { ...tvls[chainId], ...clmItem };
    }
  }

  return tvls;
};

const setVaultsTvl = async (vaults, balances, chainId, tvls) => {
  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i];

    if (EXCLUDED_IDS_FROM_TVL.includes(vault.id)) {
      console.warn('Excluding', vault.id, 'from tvl');
      continue;
    }

    const vaultBalance = balances[i];
    let tokenPrice = 0;
    try {
      const logUnknown = vault.status !== 'eol';
      tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId }, logUnknown);
    } catch (e) {
      console.error('getTvl fetchPrice', chainId, vault.oracle, vault.oracleId, e);
    }

    let tvl = vaultBalance.times(tokenPrice).shiftedBy(-vault.tokenDecimals ?? 18);

    //substract the tvl from itself
    if (vault.excluded) {
      const excludedVault = getVaultByID(vault.excluded);
      if (excludedVault && excludedVault.status === 'active') {
        tvl = tvl.minus(new BigNumber(tvls[chainId][excludedVault.id] || 0));
      }
    }

    let item = { [vault.id]: 0 };
    if (!tvl.isNaN()) {
      item = { [vault.id]: tvl.toNumber() };
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

const getCowVaultBalances = async (chainId, cowVaults) => {
  const calls = cowVaults.map(vault => {
    const tokenContract = fetchContract(vault.earnContractAddress, ERC20Abi, chainId);
    return tokenContract.read.totalSupply();
  });

  const res = await Promise.all(calls);
  return res.map(v => new BigNumber(v.toString()));
};

module.exports = getChainTvl;
