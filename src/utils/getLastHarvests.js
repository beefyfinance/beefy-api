const { MultiCall } = require('eth-multicall');
const { ethers } = require('ethers');
const { multicallAddress } = require('./web3');
const { _web3Factory } = require('./web3Helpers');
import { ChainId } from '../../packages/address-book/address-book';

const BATCH_SIZE = 128;

const strategyAbi = require('../abis/common/Strategy/StrategyCommonChefLP.json');

const getLastHarvests = async (vaults, chain) => {
  // Setup multichain
  const web3 = _web3Factory(ChainId[chain]);
  const multicall = new MultiCall(web3, multicallAddress(ChainId[chain]));

  // Split query in batches
  const query = vaults.map(v => v.strategy);
  for (let i = 0; i < vaults.length; i += BATCH_SIZE) {
    const harvestCalls = [];
    let batch = query.slice(i, i + BATCH_SIZE);
    for (let j = 0; j < batch.length; j++) {
      const strategyContract = new web3.eth.Contract(strategyAbi, batch[j]);
      harvestCalls.push({
        harvest: strategyContract.methods.lastHarvest(),
      });
    }

    const res = await multicall.all([harvestCalls]);
    const harvests = res[0].map(v => v.harvest);

    // Merge fetched data
    for (let j = 0; j < batch.length; j++) {
      vaults[j + i].lastHarvest = harvests[j] ? parseInt(harvests[j]) : 0;
    }
  }

  return vaults;
};

const addLastHarvest = async (vault, provider) => {
  try {
    let contract = new ethers.Contract(vault.strategy, strategyAbi, provider);
    let lastHarvest = 0;
    try {
      lastHarvest = await contract.lastHarvest();
    } catch (error) {}
    vault.lastHarvest = parseInt(lastHarvest);
    return vault;
  } catch (error) {
    throw error;
  }
};

const getLastHarvestsSAFE = async (vaults, provider) => {
  const responses = await Promise.allSettled(vaults.map(vault => addLastHarvest(vault, provider)));
  console.log('total of responses ', responses.length);
  let fulfilled = responses.filter(r => r.status === 'fulfilled');
  console.log('total of fulfilled ', fulfilled.length);
  let fails = responses.filter(r => r.status !== 'fulfilled').map(r => JSON.stringify(r.reason));
  console.log('total of not fulfilled ', fails.length);
  console.log({ fails });
  const fulilleds = fulfilled.map(s => s.value);
  return fulilleds;
};

module.exports = { getLastHarvests, getLastHarvestsSAFE };
