const { ethers } = require('ethers');
const { MULTICHAIN_RPC } = require('../constants');
import { ChainId } from '../../packages/address-book/address-book';

const MULTICALLS = {
  bsc: '0xE09C534adE063222BDDC1EB5DD86bBF4bf194F90',
  heco: '0x1b6Bc65dBd597220DD0e8d3D8f976F0D18DfffB6',
  polygon: '0x7a4098B4a368826BBf0Ba45DAaAe8B0DE1Bf0b12',
  fantom: '0x28373e5fF2Ea0aeabe09b2651cE6Df4Ec10982f7',
  avax: '0x9e95635A4b603AC80e6eaD48324439e7c31c384c',
};
const MulticallAbi = require('../abis/BeefyLastHarvestMulticall.json');
const BATCH_SIZE = 128;

const getLastHarvests = async (vaults, chain) => {
  // Setup multichain
  const provider = new ethers.providers.JsonRpcProvider(MULTICHAIN_RPC[ChainId[chain]]);
  const multicall = new ethers.Contract(MULTICALLS[chain], MulticallAbi, provider);

  // Split query in batches
  const query = vaults.map(v => v.strategy);
  for (let i = 0; i < vaults.length; i += BATCH_SIZE) {
    let batch = query.slice(i, i + BATCH_SIZE);
    const buf = await multicall.getLastHarvests(batch);

    // Merge fetched data
    for (let j = 0; j < batch.length; j++) {
      vaults[j + i].lastHarvest = buf[j].toNumber();
    }
  }

  return vaults;
};

module.exports = { getLastHarvests };
