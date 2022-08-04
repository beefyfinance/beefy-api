import { MultiCall } from 'eth-multicall';
import { multicallAddress } from './web3';
import { _web3Factory } from './web3Helpers';
import { ChainId } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';
import strategyAbi from '../abis/common/Strategy/StrategyCommonChefLP.json';
import {
  VaultWithChainAndStrategyAndLastHarvest,
  VaultWithChainAndStrategy,
} from '../types/config-types';
import { ChainName } from '../types/Chain';

const BATCH_SIZE = 128;

const getLastHarvests = async (
  vaults: VaultWithChainAndStrategy[],
  chain: ChainName
): Promise<VaultWithChainAndStrategyAndLastHarvest[]> => {
  // Setup multichain
  const web3 = _web3Factory(ChainId[chain]);
  const multicall = new MultiCall(web3, multicallAddress(ChainId[chain]));

  const vaultsWithLastHarvest: VaultWithChainAndStrategyAndLastHarvest[] = [
    ...Array(vaults.length),
  ];

  // Split query in batches
  const query = vaults.map(v => v.strategy);
  for (let i = 0; i < vaults.length; i += BATCH_SIZE) {
    const harvestCalls = [];
    let batch = query.slice(i, i + BATCH_SIZE);
    for (let j = 0; j < batch.length; j++) {
      const strategyContract = getContract(strategyAbi, batch[j]);
      harvestCalls.push({
        harvest: strategyContract.methods.lastHarvest(),
      });
    }

    const res = await multicall.all([harvestCalls]);
    const harvests = res[0].map(v => v.harvest);

    // Merge fetched data
    for (let j = 0; j < batch.length; j++) {
      const lastHarvest = harvests[j] ? parseInt(harvests[j]) : 0;
      vaultsWithLastHarvest[j + i] = { ...vaults[j + i], lastHarvest };
    }
  }

  return vaultsWithLastHarvest;
};

export { getLastHarvests };
