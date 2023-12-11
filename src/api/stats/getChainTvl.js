import { ChainId } from '../../../packages/address-book/address-book';
const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../utils/fetchPrice';
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
  const vaultsCalls = [
    getVaultBalances(chainId, lpVaults),
    getGovVaultBalances(chainId, govVaults),
  ];
  const [vaultBalances, govVaultBalances] = await Promise.all(vaultsCalls);

  let tvls = { [chainId]: {} };

  //first set lp vaults since some gov vaults can exlude from tvl from those
  tvls = await setVaultsTvl(lpVaults, vaultBalances, chainId, tvls);
  tvls = await setVaultsTvl(govVaults, govVaultBalances, chainId, tvls);

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

    if (vault.excluded) {
      const excludedVault = getVaultByID(vault.excluded);
      if (excludedVault && excludedVault.status === 'active') {
        tvl = tvl.minus(new BigNumber(tvls[chainId][excludedVault.id] || 0));
      }
    }

    let item = { [vault.id]: 0 };
    if (!tvl.isNaN()) {
      item = { [vault.id]: Number(tvl) };
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
