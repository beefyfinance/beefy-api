const SushiComplexRewarderTime = [
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    inputs: [
      {
        type: 'address',
        name: '_rewardToken',
        internalType: 'contract IERC20',
      },
      {
        type: 'uint256',
        name: '_rewardPerSecond',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_MASTERCHEF_V2',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'event',
    name: 'LogInit',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LogOnReward',
    inputs: [
      {
        type: 'address',
        name: 'user',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LogPoolAddition',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'allocPoint',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LogRewardPerSecond',
    inputs: [
      {
        type: 'uint256',
        name: 'rewardPerSecond',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LogSetPool',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'allocPoint',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LogUpdatePool',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
        indexed: true,
      },
      {
        type: 'uint64',
        name: 'lastRewardTime',
        internalType: 'uint64',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'lpSupply',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'accSushiPerShare',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        type: 'address',
        name: 'previousOwner',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'address',
        name: 'newOwner',
        internalType: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'add',
    inputs: [
      {
        type: 'uint256',
        name: 'allocPoint',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_pid',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'claimOwnership',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'massUpdatePools',
    inputs: [
      {
        type: 'uint256[]',
        name: 'pids',
        internalType: 'uint256[]',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'onSushiReward',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_user',
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'lpToken',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    name: 'owner',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    name: 'pendingOwner',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: 'pending',
        internalType: 'uint256',
      },
    ],
    name: 'pendingToken',
    inputs: [
      {
        type: 'uint256',
        name: '_pid',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_user',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'address[]',
        name: 'rewardTokens',
        internalType: 'contract IERC20[]',
      },
      {
        type: 'uint256[]',
        name: 'rewardAmounts',
        internalType: 'uint256[]',
      },
    ],
    name: 'pendingTokens',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'user',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'poolIds',
    inputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint128',
        name: 'accSushiPerShare',
        internalType: 'uint128',
      },
      {
        type: 'uint64',
        name: 'lastRewardTime',
        internalType: 'uint64',
      },
      {
        type: 'uint64',
        name: 'allocPoint',
        internalType: 'uint64',
      },
    ],
    name: 'poolInfo',
    inputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: 'pools',
        internalType: 'uint256',
      },
    ],
    name: 'poolLength',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'rewardPerSecond',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'set',
    inputs: [
      {
        type: 'uint256',
        name: '_pid',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_allocPoint',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setRewardPerSecond',
    inputs: [
      {
        type: 'uint256',
        name: '_rewardPerSecond',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'transferOwnership',
    inputs: [
      {
        type: 'address',
        name: 'newOwner',
        internalType: 'address',
      },
      {
        type: 'bool',
        name: 'direct',
        internalType: 'bool',
      },
      {
        type: 'bool',
        name: 'renounce',
        internalType: 'bool',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [
      {
        type: 'tuple',
        name: 'pool',
        internalType: 'struct ComplexRewarderTime.PoolInfo',
        components: [
          {
            type: 'uint128',
            name: 'accSushiPerShare',
            internalType: 'uint128',
          },
          {
            type: 'uint64',
            name: 'lastRewardTime',
            internalType: 'uint64',
          },
          {
            type: 'uint64',
            name: 'allocPoint',
            internalType: 'uint64',
          },
        ],
      },
    ],
    name: 'updatePool',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'rewardDebt',
        internalType: 'uint256',
      },
    ],
    name: 'userInfo',
    inputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalAllocPoint',
    inputs: [],
  },
] as const;

export default SushiComplexRewarderTime;
