import { ChainId } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';

const vaultAbi = require('../abis/BeefyVaultV6.json');

const getStrategies = async (vaults, chain) => {
  const contracts = vaults.map(v => fetchContract(v.earnedTokenAddress, vaultAbi, ChainId[chain]));
  const strategies = await Promise.all(contracts.map(c => c.read.strategy()));
  vaults.forEach((v, i) => (v.strategy = strategies[i]));
  return vaults;
};

module.exports = { getStrategies };
