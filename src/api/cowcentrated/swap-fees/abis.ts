import { parseAbi } from 'viem';

export const vaultAbi = parseAbi(['function want() view returns (address)']);

export const poolAbi = parseAbi(['function factory() view returns (address)', 'function fee() view returns (uint24)']);
