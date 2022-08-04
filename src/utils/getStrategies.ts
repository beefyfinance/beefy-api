import { MultiCall } from 'eth-multicall';
import { multicallAddress } from './web3';
import { _web3Factory } from './web3Helpers';
import { ChainId } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';

const BATCH_SIZE = 128;

import vaultAbi from '../abis/BeefyVaultV6.json';
import { VaultWithChain, VaultWithChainAndStrategy } from '../types/config-types';
import { ChainName } from '../types/Chain';

const getStrategies = async (
  vaults: VaultWithChain[],
  chain: ChainName
): Promise<VaultWithChainAndStrategy[]> => {
  // Setup multichain
  const web3 = _web3Factory(ChainId[chain]);
  const multicall = new MultiCall(web3, multicallAddress(ChainId[chain]));

  const vaultsWithStrat: VaultWithChainAndStrategy[] = [...Array(vaults.length)];

  // Split query in batches
  const query = vaults.map(v => v.earnedTokenAddress);
  for (let i = 0; i < vaults.length; i += BATCH_SIZE) {
    const strategyCalls = [];
    let batch = query.slice(i, i + BATCH_SIZE);
    for (let j = 0; j < batch.length; j++) {
      const vaultContract = getContract(vaultAbi, batch[j]);
      strategyCalls.push({
        strategy: vaultContract.methods.strategy(),
      });
    }

    const res = await multicall.all([strategyCalls]);
    const strategies = res[0].map(v => v.strategy);

    // Merge fetched data
    for (let j = 0; j < batch.length; j++) {
      vaultsWithStrat[j + i] = { ...vaults[j + i], strategy: strategies[j] };
    }
  }

  return vaultsWithStrat;
};

export { getStrategies };
