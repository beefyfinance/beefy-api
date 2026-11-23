import { parseAbi } from 'viem';
import { poolAbi } from '../../abis.ts';
import { managedFee } from '../../fee.ts';
import { contractOf, defineKind, probe } from '../../kind.ts';

const ramsesV3FactoryAbi = parseAbi(['function accessHub() view returns (address)']);

/** fee() is set by a keeper through the factory's access hub */
export const ramsesV3 = defineKind({
  name: 'ramses/v3',
  probe: pool =>
    pool.factory && {
      accessHub: probe({ address: pool.factory, abi: ramsesV3FactoryAbi, functionName: 'accessHub' }),
    },
  match: (_, { accessHub }) => (contractOf(accessHub) ? {} : undefined),
  fee: async (pool, reader) =>
    managedFee(await reader.read({ address: pool.address, abi: poolAbi, functionName: 'fee' })),
});
