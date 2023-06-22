const SushiMiniChefV2 = [
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    inputs: [
      {
        type: 'address',
        name: '_sushi',
        internalType: 'contract IERC20',
      },
    ],
  },
  {
    type: 'event',
    name: 'Deposit',
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
    name: 'EmergencyWithdraw',
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
    name: 'Harvest',
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
      {
        type: 'address',
        name: 'lpToken',
        internalType: 'contract IERC20',
        indexed: true,
      },
      {
        type: 'address',
        name: 'rewarder',
        internalType: 'contract IRewarder',
        indexed: true,
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
      {
        type: 'address',
        name: 'rewarder',
        internalType: 'contract IRewarder',
        indexed: true,
      },
      {
        type: 'bool',
        name: 'overwrite',
        internalType: 'bool',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LogSushiPerSecond',
    inputs: [
      {
        type: 'uint256',
        name: 'sushiPerSecond',
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
    type: 'event',
    name: 'Withdraw',
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
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'contract IERC20',
      },
    ],
    name: 'SUSHI',
    inputs: [],
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
        type: 'address',
        name: '_lpToken',
        internalType: 'contract IERC20',
      },
      {
        type: 'address',
        name: '_rewarder',
        internalType: 'contract IRewarder',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'payable',
    outputs: [
      {
        type: 'bool[]',
        name: 'successes',
        internalType: 'bool[]',
      },
      {
        type: 'bytes[]',
        name: 'results',
        internalType: 'bytes[]',
      },
    ],
    name: 'batch',
    inputs: [
      {
        type: 'bytes[]',
        name: 'calls',
        internalType: 'bytes[]',
      },
      {
        type: 'bool',
        name: 'revertOnFail',
        internalType: 'bool',
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
    name: 'deposit',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'emergencyWithdraw',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'harvest',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
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
        internalType: 'contract IERC20',
      },
    ],
    name: 'lpToken',
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
    name: 'migrate',
    inputs: [
      {
        type: 'uint256',
        name: '_pid',
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
        internalType: 'contract IMigratorChef',
      },
    ],
    name: 'migrator',
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
    name: 'pendingSushi',
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
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'permitToken',
    inputs: [
      {
        type: 'address',
        name: 'token',
        internalType: 'contract IERC20',
      },
      {
        type: 'address',
        name: 'from',
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'deadline',
        internalType: 'uint256',
      },
      {
        type: 'uint8',
        name: 'v',
        internalType: 'uint8',
      },
      {
        type: 'bytes32',
        name: 'r',
        internalType: 'bytes32',
      },
      {
        type: 'bytes32',
        name: 's',
        internalType: 'bytes32',
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
        type: 'address',
        name: '',
        internalType: 'contract IRewarder',
      },
    ],
    name: 'rewarder',
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
      {
        type: 'address',
        name: '_rewarder',
        internalType: 'contract IRewarder',
      },
      {
        type: 'bool',
        name: 'overwrite',
        internalType: 'bool',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setMigrator',
    inputs: [
      {
        type: 'address',
        name: '_migrator',
        internalType: 'contract IMigratorChef',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setSushiPerSecond',
    inputs: [
      {
        type: 'uint256',
        name: '_sushiPerSecond',
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
    name: 'sushiPerSecond',
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
    name: 'totalAllocPoint',
    inputs: [],
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
        internalType: 'struct MiniChefV2.PoolInfo',
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
        type: 'int256',
        name: 'rewardDebt',
        internalType: 'int256',
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
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'withdraw',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'withdrawAndHarvest',
    inputs: [
      {
        type: 'uint256',
        name: 'pid',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
      },
    ],
  },
] as const;

export default SushiMiniChefV2;
