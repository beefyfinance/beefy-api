const { MultiCall } = require('eth-multicall');
const { ethers } = require('ethers');
const { multicallAddress } = require('./web3');
const { _web3Factory } = require('./web3Helpers');
const { ChainId } = require('../../packages/address-book/address-book');

const BATCH_SIZE = 128;

const vaultAbi = require('../abis/BeefyVaultV6.json');

const getStrategies = async (vaults, chain) => {
  // Setup multichain
  const web3 = _web3Factory(ChainId[chain]);
  const multicall = new MultiCall(web3, multicallAddress(ChainId[chain]));

  // Split query in batches
  const query = vaults.map(v => v.earnedTokenAddress);
  for (let i = 0; i < vaults.length; i += BATCH_SIZE) {
    const strategyCalls = [];
    let batch = query.slice(i, i + BATCH_SIZE);
    for (let j = 0; j < batch.length; j++) {
      const vaultContract = new web3.eth.Contract(vaultAbi, batch[j]);
      strategyCalls.push({
        strategy: vaultContract.methods.strategy(),
      });
    }

    const res = await multicall.all([strategyCalls]);
    const strategies = res[0].map(v => v.strategy);

    // Merge fetched data
    for (let j = 0; j < batch.length; j++) {
      vaults[j + i].strategy = strategies[j];
    }
  }

  return vaults;
};

const addStrategy = async (vault, provider) => {
  try {
    let contract = new ethers.Contract(vault.earnedTokenAddress, vaultAbi, provider);
    let stratAddress = await contract.strategy();
    vault.strategy = stratAddress;
    return vault;
  } catch (error) {
    throw error;
  }
};

const getStrategiesSAFE = async (vaults, provider) => {
  const responses = await Promise.allSettled(vaults.map(vault => addStrategy(vault, provider)));
  const fulilleds = responses.filter(r => r.status === 'fulfilled').map(s => s.value);
  return fulilleds;
};

module.exports = { getStrategies, getStrategiesSAFE };
