import { AbiItem } from 'web3-utils';
import _StakingRewards_ABI from './StakingRewards.json';
import { ContractContext as StakingRewards } from './types/StakingRewards';

export const StakingRewards_ABI = _StakingRewards_ABI as unknown as AbiItem[];
export { StakingRewards };
