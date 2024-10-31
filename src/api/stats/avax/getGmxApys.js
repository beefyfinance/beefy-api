import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/avax/gmxPools.json';
import trackers from '../../../data/avax/gmxTrackers.json';
import { getGmxCommonApys } from '../common/gmx/getGmxApys';

export const getGmxApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    chainId,
  });
