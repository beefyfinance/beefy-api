import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/arbitrum/gmxPools.json';
import trackers from '../../../data/arbitrum/gmxTrackers.json';
import { getGmxCommonApys } from '../common/gmx/getGmxApys';
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  tokens: { WETH },
} = addressBook.arbitrum;

export const getGmxApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    rewards: [WETH],
    chainId,
  });
