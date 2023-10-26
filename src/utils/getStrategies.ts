import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import BeefyVaultV6Abi from '../abis/BeefyVault';
import { ApiChain } from './chain';
import { Vault } from '../api/vaults/types';

const getStrategies = async (vaults: Vault[], chain: ApiChain) => {
  const chainId = ChainId[chain];

  const strategyAddreses = vaults.map(v => v.earnedTokenAddress);

  const stategiesCalls = strategyAddreses.map(earnedTokenAddress => {
    const vaultContract = fetchContract(earnedTokenAddress, BeefyVaultV6Abi, chainId);
    return vaultContract.read.strategy();
  });

  const res = await Promise.all(stategiesCalls);

  const strategies = res.map(strategy => strategy);

  for (let i = 0; i < strategies.length; i++) {
    vaults[i].strategy = strategies[i];
  }
  return vaults;
};

module.exports = { getStrategies };
