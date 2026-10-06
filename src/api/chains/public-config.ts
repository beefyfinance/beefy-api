import { pick } from 'lodash-es';
import { type ApiChain, getChainConfig } from '../../utils/chain.ts';
import { createCachedFactory } from '../../utils/factory.ts';

export const getPublicChainConfig = createCachedFactory(
  (chainId: ApiChain) => {
    const config = getChainConfig(chainId);
    if (!config) {
      return undefined;
    }

    return pick(config, [
      'id',
      'status',
      'appChain',
      'name',
      'features',
      'rpcs',
      'explorer',
      'contracts',
      'integrations',
    ]);
  },
  (chainId: ApiChain) => chainId
);
