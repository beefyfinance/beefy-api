import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import { Vault } from '../api/vaults/types';

const govVaultAbi = require('../abis/BeefyEarningsPoolAbi.json');

const getGovVaultsTotalSupply = async (vaults, chain) => {
  const contracts = vaults.map(v =>
    fetchContract(v.earnContractAddress, govVaultAbi, ChainId[chain])
  );

  const totalSupplies = await Promise.allSettled(contracts.map(c => c.read.totalSupply()));
  vaults.forEach(
    (v, i) =>
      (v.totalSupply = totalSupplies[i].status === 'fulfilled' ? Number(totalSupplies[i].value) : 0)
  );
  return vaults;
};

module.exports = { getGovVaultsTotalSupply };
