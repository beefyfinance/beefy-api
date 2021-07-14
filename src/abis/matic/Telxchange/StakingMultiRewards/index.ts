import { AbiItem } from 'web3-utils';
import _StakingMultiRewards_ABI from './StakingMultiRewards.json';
import { ContractContext as StakingMultiRewards } from './types/StakingMultiRewards';

export const StakingMultiRewards_ABI = _StakingMultiRewards_ABI as unknown as AbiItem[];
export { StakingMultiRewards };
