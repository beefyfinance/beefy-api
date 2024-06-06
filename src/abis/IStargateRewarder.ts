const IStargateRewarder = [
  {
    inputs: [
      {
        internalType: 'contract IStargateStaking',
        name: '_staking',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'MultiRewarderDisconnectedStakingToken',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'expected',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'actual',
        type: 'uint256',
      },
    ],
    name: 'MultiRewarderIncorrectNative',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiRewarderMaxActiveRewardTokens',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiRewarderMaxPoolsForRewardToken',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'MultiRewarderNativeTransferFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'MultiRewarderPoolFinished',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiRewarderRenounceOwnershipDisabled',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'start',
        type: 'uint256',
      },
    ],
    name: 'MultiRewarderStartInPast',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
    ],
    name: 'MultiRewarderUnauthorizedCaller',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'MultiRewarderUnregisteredToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiRewarderZeroDuration',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MultiRewarderZeroRewardRate',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'stakingToken',
        type: 'address',
      },
    ],
    name: 'RewarderAlreadyConnected',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IERC20[]',
        name: 'stakeToken',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'uint48[]',
        name: 'allocPoint',
        type: 'uint48[]',
      },
    ],
    name: 'AllocPointsSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'stakeToken',
        type: 'address',
      },
    ],
    name: 'PoolRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountAdded',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'newEnd',
        type: 'uint48',
      },
    ],
    name: 'RewardExtended',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'RewardRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountAdded',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountPeriod',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'start',
        type: 'uint48',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'duration',
        type: 'uint48',
      },
    ],
    name: 'RewardSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'pullTokens',
        type: 'bool',
      },
    ],
    name: 'RewardStopped',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'stakingToken',
        type: 'address',
      },
    ],
    name: 'RewarderConnected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'rewardTokens',
        type: 'address[]',
      },
      {
        indexed: false,
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
    ],
    name: 'RewardsClaimed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'allocPointsByReward',
    outputs: [
      {
        internalType: 'contract IERC20[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint48[]',
        name: '',
        type: 'uint48[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'stakingToken',
        type: 'address',
      },
    ],
    name: 'allocPointsByStake',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint48[]',
        name: '',
        type: 'uint48[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'stakingToken',
        type: 'address',
      },
    ],
    name: 'connect',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'extendReward',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'stakingToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getRewards',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'stakingToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'oldStake',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'oldSupply',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'onUpdate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'rewardDetails',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'rewardPerSec',
            type: 'uint256',
          },
          {
            internalType: 'uint160',
            name: 'totalAllocPoints',
            type: 'uint160',
          },
          {
            internalType: 'uint48',
            name: 'start',
            type: 'uint48',
          },
          {
            internalType: 'uint48',
            name: 'end',
            type: 'uint48',
          },
          {
            internalType: 'bool',
            name: 'exists',
            type: 'bool',
          },
        ],
        internalType: 'struct IMultiRewarder.RewardDetails',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardTokens',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        internalType: 'contract IERC20[]',
        name: 'stakingTokens',
        type: 'address[]',
      },
      {
        internalType: 'uint48[]',
        name: 'allocPoints',
        type: 'uint48[]',
      },
    ],
    name: 'setAllocPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint48',
        name: 'start',
        type: 'uint48',
      },
      {
        internalType: 'uint48',
        name: 'duration',
        type: 'uint48',
      },
    ],
    name: 'setReward',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'staking',
    outputs: [
      {
        internalType: 'contract IStargateStaking',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'pullTokens',
        type: 'bool',
      },
    ],
    name: 'stopReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default IStargateRewarder;
