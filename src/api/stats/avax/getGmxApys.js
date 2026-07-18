import { AVAX_CHAIN_ID as chainId } from '../../../constants.ts';
import pools from '../../../data/avax/gmxPools.json' with { type: "json" };
import trackers from '../../../data/avax/gmxTrackers.json' with { type: "json" };
import { getGmxCommonApys } from '../common/gmx/getGmxApys.ts';

export const getGmxApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    chainId,
  });
