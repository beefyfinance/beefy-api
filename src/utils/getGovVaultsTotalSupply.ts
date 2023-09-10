import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import { GovVault } from '../api/vaults/types';
import BeefyBoostAbi from '../abis/BeefyEarningsPool';
import { ApiChain } from './chain';
import BigNumber from 'bignumber.js';

const getGovVaultsTotalSupply = async (vaults: GovVault[], chain: ApiChain) => {
  const chainId = ChainId[chain];

  const govVaultAddresses = vaults.map(v => v.earnContractAddress);
  const totalSupplyCalls = govVaultAddresses.map(govVaultAddress => {
    const govVaultContract = fetchContract(govVaultAddress, BeefyBoostAbi, chainId);
    return govVaultContract.read.totalSupply();
  });

  const res = await Promise.all(totalSupplyCalls);

  const totalSupplies = res.map(v => new BigNumber(v.toString()).toNumber());

  for (let i = 0; i < totalSupplies.length; i++) {
    vaults[i].totalSupply = totalSupplies[i];
  }

  return vaults;
};

module.exports = { getGovVaultsTotalSupply };
