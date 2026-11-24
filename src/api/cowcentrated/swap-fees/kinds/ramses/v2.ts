import { parseAbi } from 'viem';
import { managedFee } from '../../fee.ts';
import { defineKind, probe } from '../../kind.ts';

const ramsesV2PoolAbi = parseAbi(['function currentFee() view returns (uint24)']);

/** fee() is the tier the pool was created with, currentFee() is what swaps pay */
export const ramsesV2 = defineKind({
  name: 'ramses/v2',
  probe: pool => ({
    currentFee: probe({ address: pool.address, abi: ramsesV2PoolAbi, functionName: 'currentFee' }),
  }),
  match: (_, { currentFee }) => (currentFee.ok ? { currentFee: currentFee.value } : undefined),
  fee: async pool => managedFee(pool.currentFee),
});
