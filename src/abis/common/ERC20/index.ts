import { AbiItem } from 'web3-utils';
import _ERC20_ABI from './ERC20.json';
import { ContractContext as ERC20 } from './types/ERC20';

export const ERC20_ABI = _ERC20_ABI as unknown as AbiItem[];
export { ERC20 };
