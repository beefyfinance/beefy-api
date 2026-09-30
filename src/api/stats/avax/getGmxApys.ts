import { ApiChainId } from '../../../utils/chain.ts';
import { getGmxCommonApys } from '../common/gmx/getGmxApys.ts';
import pools from '../../../data/avax/gmxPools.json' with { type: 'json' };
import trackers from '../../../data/avax/gmxTrackers.json' with { type: 'json' };

export const getGmxApys = async () =>
  await getGmxCommonApys({
    pools,
    trackers,
    chainId: ApiChainId.avax,
  });
