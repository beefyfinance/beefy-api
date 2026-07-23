import { AVAX_CHAIN_ID as chainId } from '../../../constants.ts';
import { getRewardPoolApys } from '../common/getRewardPoolApys.js';
import volatilePools from '../../../data/avax/blackLpPools.json' with { type: 'json' };
import stablePools from '../../../data/avax/blackStableLpPools.json' with { type: 'json' };

const pools = [...stablePools, ...volatilePools];
export const getBlackholeApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'BLACK',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
