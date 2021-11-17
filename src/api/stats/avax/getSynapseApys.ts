import { avaxWeb3 } from '../../../utils/web3';
import { AVAX_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';

import SynapseMiniChefV2 from '../../../abis/avax/SynapseMiniChefV2.json';
import _pools from '../../../data/avax/synapsePools.json';
const pools: SingleAssetPool[] = _pools;

import { addressBook } from '../../../../packages/address-book/address-book';
import { SingleAssetPool } from '../../../types/LpPool';
import { AbiItem } from 'web3-utils';

const {
  avax: {
    platforms: {
      synapse: { chef },
    },
    tokens: { SYN },
  },
} = addressBook;

export const getSynapseApys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef: chef,
      minichefAbi: SynapseMiniChefV2 as AbiItem[],
      outputOracleId: SYN.symbol,
      tokenPerSecondContractMethodName: 'synapsePerSecond',
    },
    pools,
    web3: avaxWeb3,
    chainId: AVAX_CHAIN_ID,
  });
};
