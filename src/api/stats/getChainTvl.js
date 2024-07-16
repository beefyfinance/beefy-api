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

    //subsctract the tvl from the parent clm
    if (vault.type === 'gov' && vault.version === 2 && vault.id.endsWith('-rp')) {
      console.log('hi', vault.oracleId);
      const nakedCLmTvl = new BigNumber(tvls[chainId][vault.oracleId] || 0);
      if (nakedCLmTvl.gt(0)) {
        //sometimes the reward pool can have idle founds in the strategy and the tvl can be greater than the clm, in this case we set the naked clm tvl to 0
        const clmItem = {
          [vault.oracleId]: nakedCLmTvl.gt(tvl) ? nakedCLmTvl.minus(tvl).toNumber() : 0,
        };
        tvls[chainId] = { ...tvls[chainId], ...clmItem };
      }
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
