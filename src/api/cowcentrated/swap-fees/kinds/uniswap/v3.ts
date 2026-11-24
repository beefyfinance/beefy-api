import { poolAbi } from '../../abis.ts';
import { fixedFee } from '../../fee.ts';
import { defineKind } from '../../kind.ts';

/** Fee set when the pool is created */
export const uniswapV3 = defineKind({
  name: 'uniswap/v3',
  probe: () => ({}),
  match: () => ({}),
  fee: async (pool, reader) =>
    fixedFee(await reader.read({ address: pool.address, abi: poolAbi, functionName: 'fee' })),
});
