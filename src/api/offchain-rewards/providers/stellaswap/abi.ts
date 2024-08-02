import { Abi } from 'viem';

export const rewardRegistryAbi = [
  {
    inputs: [],
    name: 'getAllPools',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'pool',
            type: 'address',
          },
          {
            internalType: 'contract IRewarder',
            name: 'rewarder',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'isPaused',
            type: 'bool',
          },
        ],
        internalType: 'struct RewardRegistry.Pool[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export const rewarderAbi = [
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'rewardInfo',
    outputs: [
      { internalType: 'contract IERC20', name: 'token', type: 'address' },
      {
        internalType: 'bool',
        name: 'isNative',
        type: 'bool',
      },
      { internalType: 'uint32', name: 'startTimestamp', type: 'uint32' },
      {
        internalType: 'uint32',
        name: 'endTimestamp',
        type: 'uint32',
      },
      { internalType: 'uint256', name: 'rewardPerSec', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardInfoLength',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;
