const ISolarVault = [
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    inputs: [
      {
        type: 'address',
        name: '_solar',
        internalType: 'contract ISolarERC20',
      },
      {
        type: 'uint256',
        name: '_solarPerBlock',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'AllocPointsUpdated',
    inputs: [
      {
        type: 'address',
        name: 'caller',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'previousAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newAmount',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
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
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DevAddressChanged',
    inputs: [
      {
        type: 'address',
        name: 'caller',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'address',
        name: 'oldAddress',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newAddress',
        internalType: 'address',
        indexed: false,
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
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EmissionRateUpdated',
    inputs: [
      {
        type: 'address',
        name: 'caller',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'previousAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newAmount',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FeeAddressChanged',
    inputs: [
      {
        type: 'address',
        name: 'caller',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'address',
        name: 'oldAddress',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newAddress',
        internalType: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MetaTxnsDisabled',
    inputs: [
      {
        type: 'address',
        name: 'caller',
        internalType: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MetaTxnsEnabled',
    inputs: [
      {
        type: 'address',
        name: 'caller',
        internalType: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OperatorTransferred',
    inputs: [
      {
        type: 'address',
        name: 'previousOperator',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'address',
        name: 'newOperator',
        internalType: 'address',
        indexed: true,
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
    name: 'RewardLockedUp',
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
        name: 'amountLockedUp',
        internalType: 'uint256',
        indexed: false,
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
    ],
    anonymous: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint16',
        name: '',
        internalType: 'uint16',
      },
    ],
    name: 'MAXIMUM_DEPOSIT_FEE_RATE',
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
    name: 'MAXIMUM_HARVEST_INTERVAL',
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
        name: '_allocPoint',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: '_lpToken',
        internalType: 'contract IERC20',
      },
      {
        type: 'uint16',
        name: '_depositFeeBP',
        internalType: 'uint16',
      },
      {
        type: 'uint256',
        name: '_harvestInterval',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_lockupDuration',
        internalType: 'uint256',
      },
      {
        type: 'bool',
        name: '_withUpdate',
        internalType: 'bool',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'canHarvest',
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
    name: 'deposit',
    inputs: [
      {
        type: 'uint256',
        name: '_pid',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_amount',
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
    name: 'devAddress',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'disableMetaTxns',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'enableMetaTxns',
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
    name: 'feeAddress',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'pure',
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'getMultiplier',
    inputs: [
      {
        type: 'uint256',
        name: '_from',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_to',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'isTrustedForwarder',
    inputs: [
      {
        type: 'address',
        name: 'forwarder',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'massUpdatePools',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'metaTxnsEnabled',
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
    name: 'operator',
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
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'pendingSolar',
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
        type: 'address',
        name: 'lpToken',
        internalType: 'contract IERC20',
      },
      {
        type: 'uint256',
        name: 'allocPoint',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'lastRewardBlock',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'accSolarPerShare',
        internalType: 'uint256',
      },
      {
        type: 'uint16',
        name: 'depositFeeBP',
        internalType: 'uint16',
      },
      {
        type: 'uint256',
        name: 'harvestInterval',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'totalLp',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'lockupDuration',
        internalType: 'uint256',
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
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'poolLength',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'renounceOwnership',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setDevAddress',
    inputs: [
      {
        type: 'address',
        name: '_devAddress',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setFeeAddress',
    inputs: [
      {
        type: 'address',
        name: '_feeAddress',
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
        internalType: 'contract ISolarERC20',
      },
    ],
    name: 'solar',
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
    name: 'solarPerBlock',
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
    name: 'startBlock',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'startFarming',
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
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalLockedUpRewards',
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
    name: 'totalSolarInPools',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'transferOperator',
    inputs: [
      {
        type: 'address',
        name: 'newOperator',
        internalType: 'address',
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
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'updateAllocPoint',
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
        type: 'bool',
        name: '_withUpdate',
        internalType: 'bool',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'updateEmissionRate',
    inputs: [
      {
        type: 'uint256',
        name: '_solarPerBlock',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'updatePool',
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
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'rewardDebt',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'rewardLockedUp',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'nextHarvestUntil',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'lastInteraction',
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
    name: 'userLockedUntil',
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
    name: 'withdraw',
    inputs: [
      {
        type: 'uint256',
        name: '_pid',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_amount',
        internalType: 'uint256',
      },
    ],
  },
] as const;

export default ISolarVault;
