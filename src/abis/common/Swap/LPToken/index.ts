import { AbiItem } from 'web3-utils';
import _LPToken_ABI from './LPToken.json';
import { ContractContext as LPToken } from './types/LPToken';

// Based off of IronSwap LPToken (0xb4d09ff3da7f9e9a2ba029cb0a81a989fd7b8f17) on polygon

export const LPToken_ABI = _LPToken_ABI as unknown as AbiItem[];
export { LPToken };
