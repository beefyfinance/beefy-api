import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getMerklApys } from '../common/getMerklApys';
import { MONAD_CHAIN_ID as chainId } from '../../../constants';

const pools = require('../../../data/monad/uniswapLpPools.json').filter(p => p.merkl);

export const getUniswapApys = async () => {
  const [merklApys] = await Promise.all([getMerklApys(chainId, pools)]);

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: merklApys[i] })));
};
