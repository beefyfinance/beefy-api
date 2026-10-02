import { ApiChainId } from '../../../utils/chain.ts';
import { getRewardPoolApys } from '../common/getRewardPoolApys.ts';
import volatilePools from '../../../data/avax/blackLpPools.json' with { type: 'json' };
import stablePools from '../../../data/avax/blackStableLpPools.json' with { type: 'json' };

const pools = [...stablePools, ...volatilePools];
export const getBlackholeApys = async () => {
  return getRewardPoolApys({
    chainId: ApiChainId.avax,
    pools: pools,
    oracleId: 'BLACK',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
