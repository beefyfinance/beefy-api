const BetSwirlSingleStaking = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_stakingToken',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardDuration',
        type: 'uint256',
      },
    ],
    name: 'AddRewardToken',
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
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Recovered',
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
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'RewardAdded',
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
        internalType: 'address',
        name: 'rewardsToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'RewardPaid',
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
        indexed: false,
        internalType: 'uint256',
        name: 'newDuration',
        type: 'uint256',
      },
    ],
    name: 'RewardsDurationUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'SetStakingToken',
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
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Staked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
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
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
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
        internalType: 'address',
        name: '_rewardsToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_rewardsDistributor',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_rewardsDuration',
        type: 'uint256',
      },
    ],
    name: 'addReward',
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
    name: 'balanceOf',
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
        internalType: 'address',
        name: '_rewardsToken',
        type: 'address',
      },
    ],
    name: 'earned',
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
    inputs: [],
    name: 'exit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getInfo',
    outputs: [
      {
        internalType: 'uint256',
        name: '__totalSupply',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'uint8',
            name: 'decimals',
            type: 'uint8',
          },
        ],
        internalType: 'struct SingleStaking.Token',
        name: '_stakingToken',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'tokenAddress',
                type: 'address',
              },
              {
                internalType: 'string',
                name: 'name',
                type: 'string',
              },
              {
                internalType: 'string',
                name: 'symbol',
                type: 'string',
              },
              {
                internalType: 'uint8',
                name: 'decimals',
                type: 'uint8',
              },
            ],
            internalType: 'struct SingleStaking.Token',
            name: 'token',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'rewardsDistributor',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'rewardsDuration',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'periodFinish',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'rewardRate',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'lastUpdateTime',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'rewardPerTokenStored',
                type: 'uint256',
              },
            ],
            internalType: 'struct SingleStaking.Reward',
            name: 'rewardData',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'lastTimeRewardApplicable',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewardPerToken',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewardForDuration',
            type: 'uint256',
          },
        ],
        internalType: 'struct SingleStaking.RewardToken[]',
        name: '_rewardTokens',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_rewardsToken',
        type: 'address',
      },
    ],
    name: 'getRewardForDuration',
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
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getToken',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'uint8',
            name: 'decimals',
            type: 'uint8',
          },
        ],
        internalType: 'struct SingleStaking.Token',
        name: '_token',
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
        name: '_rewardsToken',
        type: 'address',
      },
    ],
    name: 'lastTimeRewardApplicable',
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
        name: '_rewardsToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'notifyRewardAmount',
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
    name: 'paused',
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
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardData',
    outputs: [
      {
        internalType: 'address',
        name: 'rewardsDistributor',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'rewardsDuration',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'periodFinish',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'rewardRate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastUpdateTime',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'rewardPerTokenStored',
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
        name: '_rewardsToken',
        type: 'address',
      },
    ],
    name: 'rewardPerToken',
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
        name: '',
        type: 'uint256',
      },
    ],
    name: 'rewardTokens',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewards',
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
        name: '_rewardsToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_rewardsDistributor',
        type: 'address',
      },
    ],
    name: 'setRewardsDistributor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_rewardsToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_rewardsDuration',
        type: 'uint256',
      },
    ],
    name: 'setRewardsDuration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'stakingToken',
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
    name: 'totalSupply',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'userRewardPerTokenPaid',
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

export default BetSwirlSingleStaking;
