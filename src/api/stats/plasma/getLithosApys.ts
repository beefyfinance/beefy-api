import { ApiChainId } from '../../../utils/chain.ts';
import { getRewardPoolApys } from '../common/getRewardPoolApys.ts';
import volatilePools from '../../../data/plasma/lithosPools.json' with { type: 'json' };
import stablePools from '../../../data/plasma/lithosStablePools.json' with { type: 'json' };

const pools = [...stablePools, ...volatilePools];
export const getLithosApys = async () => {
  return getRewardPoolApys({
    chainId: ApiChainId.plasma,
    pools: pools,
    oracleId: 'LITH',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
