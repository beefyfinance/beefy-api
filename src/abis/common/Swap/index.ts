import { AbiItem } from 'web3-utils';
import _Swap_ABI from './Swap.json';
import { ContractContext as Swap } from './types/Swap';

// Based off of IronSwap (0x837503e8A8753ae17fB8C8151B8e6f586defCb57) on polygon

export const Swap_ABI = _Swap_ABI as unknown as AbiItem[];
export { Swap };
