import { KAVA_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/kava/kinetixPools.json';
import trackers from '../../../data/kava/kinetixTrackers.json';
import { getGmxCommonApys } from '../common/gmx/getGmxApys';
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  tokens: { WKAVA, USDT },
} = addressBook.kava;

export const getKinetixApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    rewards: [WKAVA, USDT],
    chainId,
  });
