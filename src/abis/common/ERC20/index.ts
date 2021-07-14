import { AbiItem } from 'web3-utils';
import _ERC20_ABI from './ERC20.json';

export const ERC20_ABI = _ERC20_ABI as unknown as AbiItem[];
export * from './types/ERC20';
