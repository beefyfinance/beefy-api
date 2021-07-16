import { AbiItem } from 'web3-utils';
import _FarmHeroChef_ABI from './FarmHeroChef.json';
import { ContractContext as FarmHeroChef } from './types/FarmHeroChef';

export const FarmHeroChef_ABI = _FarmHeroChef_ABI as unknown as AbiItem[];
export { FarmHeroChef };
