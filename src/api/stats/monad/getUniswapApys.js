import { getApyBreakdown } from '../common/getApyBreakdownNew.ts';
import { getMerklApys } from '../common/getMerklApys.js';
import { MONAD_CHAIN_ID as chainId } from '../../../constants.ts';
import uniswapLpPoolsData from '../../../data/monad/uniswapLpPools.json' with { type: "json" };

const pools = uniswapLpPoolsData.filter(p => p.merkl);

export const getUniswapApys = async () => {
  const [merklApys] = await Promise.all([getMerklApys(chainId, pools)]);

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: merklApys[i] })));
};
