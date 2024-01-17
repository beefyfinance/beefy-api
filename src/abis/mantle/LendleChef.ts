const LendleChef = [
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
    name: 'VERSION',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'addPool',
    inputs: [
      {
        type: 'address',
        name: '_token',
        internalType: 'address',
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
    name: 'batchUpdateAllocPoint',
    inputs: [
      {
        type: 'address[]',
        name: '_tokens',
        internalType: 'address[]',
      },
      {
        type: 'uint256[]',
        name: '_allocPoints',
        internalType: 'uint256[]',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'claim',
    inputs: [
      {
        type: 'address',
        name: '_user',
        internalType: 'address',
      },
      {
        type: 'address[]',
        name: '_tokens',
        internalType: 'address[]',
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
    name: 'claimReceiver',
    inputs: [
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
        type: 'uint256[]',
        name: '',
        internalType: 'uint256[]',
      },
    ],
    name: 'claimableReward',
    inputs: [
      {
        type: 'address',
        name: '_user',
        internalType: 'address',
      },
      {
        type: 'address[]',
        name: '_tokens',
        internalType: 'address[]',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint128',
        name: 'startTimeOffset',
        internalType: 'uint128',
      },
      {
        type: 'uint128',
        name: 'rewardsPerSecond',
        internalType: 'uint128',
      },
    ],
    name: 'emissionSchedule',
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
    name: 'handleAction',
    inputs: [
      {
        type: 'address',
        name: '_user',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: '_balance',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_totalSupply',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'initialize',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        internalType: 'address',
      },
      {
        type: 'uint128[]',
        name: '_startTimeOffset',
        internalType: 'uint128[]',
      },
      {
        type: 'uint128[]',
        name: '_rewardsPerSecond',
        internalType: 'uint128[]',
      },
      {
        type: 'address',
        name: '_poolConfigurator',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '_rewardMinter',
        internalType: 'contract IMultiFeeDistribution',
      },
      {
        type: 'uint256',
        name: '_maxMintable',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '_startTime',
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
    name: 'maxMintableTokens',
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
    name: 'mintedTokens',
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
    name: 'poolConfigurator',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'uint256',
        name: 'totalSupply',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'allocPoint',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'lastRewardTime',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'accRewardPerShare',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'onwardIncentives',
        internalType: 'contract IOnwardIncentivesController',
      },
    ],
    name: 'poolInfo',
    inputs: [
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
        internalType: 'address',
      },
    ],
    name: 'registeredTokens',
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
    name: 'renounceOwnership',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'contract IMultiFeeDistribution',
      },
    ],
    name: 'rewardMinter',
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
    name: 'rewardsPerSecond',
    inputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setClaimReceiver',
    inputs: [
      {
        type: 'address',
        name: '_user',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '_receiver',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [],
    name: 'setOnwardIncentives',
    inputs: [
      {
        type: 'address',
        name: '_token',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '_incentives',
        internalType: 'contract IOnwardIncentivesController',
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
    name: 'startTime',
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
    name: 'userBaseClaimable',
    inputs: [
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
        type: 'address',
        name: '',
        internalType: 'address',
      },
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'event',
    name: 'BalanceUpdated',
    inputs: [
      {
        type: 'address',
        name: 'token',
        indexed: true,
      },
      {
        type: 'address',
        name: 'user',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'balance',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'totalSupply',
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
        indexed: true,
      },
      {
        type: 'address',
        name: 'newOwner',
        indexed: true,
      },
    ],
    anonymous: false,
  },
] as const;

export default LendleChef;
