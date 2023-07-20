const ExactlyRewardsController = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'IndexOverflow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidConfig',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'operation',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'accountIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'operationIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardsAccrued',
        type: 'uint256',
      },
    ],
    name: 'Accrue',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Claim',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract Market',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'contract ERC20',
            name: 'reward',
            type: 'address',
          },
          {
            internalType: 'contract IPriceFeed',
            name: 'priceFeed',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'start',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'distributionPeriod',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'targetDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalDistribution',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'undistributedFactor',
            type: 'uint256',
          },
          {
            internalType: 'int128',
            name: 'flipSpeed',
            type: 'int128',
          },
          {
            internalType: 'uint64',
            name: 'compensationFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'transitionFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'borrowAllocationWeightFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'depositAllocationWeightAddend',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'depositAllocationWeightFactor',
            type: 'uint64',
          },
        ],
        indexed: false,
        internalType: 'struct RewardsController.Config',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'DistributionSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'borrowIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'depositIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newUndistributed',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lastUpdate',
        type: 'uint256',
      },
    ],
    name: 'IndexUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'UTILIZATION_CAP',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'operation',
        type: 'bool',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
    ],
    name: 'accountOperation',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
    ],
    name: 'allClaimable',
    outputs: [
      {
        internalType: 'uint256',
        name: 'unclaimedRewards',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'allMarketsOperations',
    outputs: [
      {
        components: [
          {
            internalType: 'contract Market',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'bool[]',
            name: 'operations',
            type: 'bool[]',
          },
        ],
        internalType: 'struct RewardsController.MarketOperation[]',
        name: 'marketOps',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'allRewards',
    outputs: [
      {
        internalType: 'contract ERC20[]',
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
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'availableRewardsCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract Market',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'bool[]',
            name: 'operations',
            type: 'bool[]',
          },
        ],
        internalType: 'struct RewardsController.MarketOperation[]',
        name: 'marketOps',
        type: 'tuple[]',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'contract ERC20[]',
        name: 'rewardsList',
        type: 'address[]',
      },
    ],
    name: 'claim',
    outputs: [
      {
        internalType: 'contract ERC20[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'claimedAmounts',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'claimAll',
    outputs: [
      {
        internalType: 'contract ERC20[]',
        name: 'rewardsList',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'claimedAmounts',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract Market',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'bool[]',
            name: 'operations',
            type: 'bool[]',
          },
        ],
        internalType: 'struct RewardsController.MarketOperation[]',
        name: 'marketOps',
        type: 'tuple[]',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
    ],
    name: 'claimable',
    outputs: [
      {
        internalType: 'uint256',
        name: 'unclaimedRewards',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'contract Market',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'contract ERC20',
            name: 'reward',
            type: 'address',
          },
          {
            internalType: 'contract IPriceFeed',
            name: 'priceFeed',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'start',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'distributionPeriod',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'targetDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalDistribution',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'undistributedFactor',
            type: 'uint256',
          },
          {
            internalType: 'int128',
            name: 'flipSpeed',
            type: 'int128',
          },
          {
            internalType: 'uint64',
            name: 'compensationFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'transitionFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'borrowAllocationWeightFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'depositAllocationWeightAddend',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'depositAllocationWeightFactor',
            type: 'uint64',
          },
        ],
        internalType: 'struct RewardsController.Config[]',
        name: 'configs',
        type: 'tuple[]',
      },
    ],
    name: 'config',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Market',
        name: '',
        type: 'address',
      },
    ],
    name: 'distribution',
    outputs: [
      {
        internalType: 'uint8',
        name: 'availableRewardsCount',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'baseUnit',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
    ],
    name: 'distributionTime',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'handleBorrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'handleDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'marketList',
    outputs: [
      {
        internalType: 'contract Market',
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
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'deltaTime',
        type: 'uint256',
      },
    ],
    name: 'previewAllocation',
    outputs: [
      {
        internalType: 'uint256',
        name: 'borrowIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'depositIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newUndistributed',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
    ],
    name: 'rewardConfig',
    outputs: [
      {
        components: [
          {
            internalType: 'contract Market',
            name: 'market',
            type: 'address',
          },
          {
            internalType: 'contract ERC20',
            name: 'reward',
            type: 'address',
          },
          {
            internalType: 'contract IPriceFeed',
            name: 'priceFeed',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'start',
            type: 'uint32',
          },
          {
            internalType: 'uint256',
            name: 'distributionPeriod',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'targetDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalDistribution',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'undistributedFactor',
            type: 'uint256',
          },
          {
            internalType: 'int128',
            name: 'flipSpeed',
            type: 'int128',
          },
          {
            internalType: 'uint64',
            name: 'compensationFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'transitionFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'borrowAllocationWeightFactor',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'depositAllocationWeightAddend',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'depositAllocationWeightFactor',
            type: 'uint64',
          },
        ],
        internalType: 'struct RewardsController.Config',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ERC20',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardEnabled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Market',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'contract ERC20',
        name: 'reward',
        type: 'address',
      },
    ],
    name: 'rewardIndexes',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'rewardList',
    outputs: [
      {
        internalType: 'contract ERC20',
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
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ERC20',
        name: 'asset',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default ExactlyRewardsController;
