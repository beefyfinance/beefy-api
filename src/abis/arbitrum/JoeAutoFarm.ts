const JoeAutoFarm = [
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '_joe',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'APTFarm__EmptyArray',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'deposit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountWithdrawn',
        type: 'uint256',
      },
    ],
    name: 'APTFarm__InsufficientDeposit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'APTFarm__InvalidAPToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'APTFarm__InvalidFarmIndex',
    type: 'error',
  },
  {
    inputs: [],
    name: 'APTFarm__InvalidJoePerSec',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'apToken',
        type: 'address',
      },
    ],
    name: 'APTFarm__TokenAlreadyHasFarm',
    type: 'error',
  },
  {
    inputs: [],
    name: 'APTFarm__ZeroAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'APTFarm__ZeroAmount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'allocPoint',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'apToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IRewarder',
        name: 'rewarder',
        type: 'address',
      },
    ],
    name: 'Add',
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
        internalType: 'uint256[]',
        name: 'pids',
        type: 'uint256[]',
      },
    ],
    name: 'BatchHarvest',
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
        indexed: true,
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposit',
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
        indexed: true,
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'EmergencyWithdraw',
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
        indexed: true,
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'unpaidAmount',
        type: 'uint256',
      },
    ],
    name: 'Harvest',
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
    name: 'OwnershipTransferStarted',
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
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'allocPoint',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'contract IRewarder',
        name: 'rewarder',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'overwrite',
        type: 'bool',
      },
    ],
    name: 'Set',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
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
    name: 'Skim',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lastRewardTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lpSupply',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'accJoePerShare',
        type: 'uint256',
      },
    ],
    name: 'UpdateFarm',
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
        indexed: true,
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'joePerSec',
        type: 'uint256',
      },
      {
        internalType: 'contract IERC20',
        name: 'apToken',
        type: 'address',
      },
      {
        internalType: 'contract IRewarder',
        name: 'rewarder',
        type: 'address',
      },
    ],
    name: 'add',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    name: 'apTokenBalances',
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
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'farmInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'contract IERC20',
            name: 'apToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'accJoePerShare',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastRewardTimestamp',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'joePerSec',
            type: 'uint256',
          },
          {
            internalType: 'contract IRewarder',
            name: 'rewarder',
            type: 'address',
          },
        ],
        internalType: 'struct IAPTFarm.FarmInfo',
        name: 'farm',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'farmLength',
    outputs: [
      {
        internalType: 'uint256',
        name: 'farms',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'pids',
        type: 'uint256[]',
      },
    ],
    name: 'harvestRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'apToken',
        type: 'address',
      },
    ],
    name: 'hasFarm',
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
    name: 'joe',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
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
    name: 'pendingOwner',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'pendingTokens',
    outputs: [
      {
        internalType: 'uint256',
        name: 'pendingJoe',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'bonusTokenAddress',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'bonusTokenSymbol',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'pendingBonusToken',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'joePerSec',
        type: 'uint256',
      },
      {
        internalType: 'contract IRewarder',
        name: 'rewarder',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'overwrite',
        type: 'bool',
      },
    ],
    name: 'set',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'skim',
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
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'userInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewardDebt',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'unpaidRewards',
            type: 'uint256',
          },
        ],
        internalType: 'struct IAPTFarm.UserInfo',
        name: 'info',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'apToken',
        type: 'address',
      },
    ],
    name: 'vaultFarmId',
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
        internalType: 'uint256',
        name: 'pid',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default JoeAutoFarm;
