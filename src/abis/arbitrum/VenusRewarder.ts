const VenusRewarderAbi = [
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'timeBased_',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'blocksPerYear_',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'InvalidBlocksPerYear',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidTimeBasedConfiguration',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'loopsLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'requiredLoops',
        type: 'uint256',
      },
    ],
    name: 'MaxLoopsLimitExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'calledContract',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'methodSignature',
        type: 'string',
      },
    ],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newTimestamp',
        type: 'uint256',
      },
    ],
    name: 'BorrowLastRewardingBlockTimestampUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'newBlock',
        type: 'uint32',
      },
    ],
    name: 'BorrowLastRewardingBlockUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'contributor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newSpeed',
        type: 'uint256',
      },
    ],
    name: 'ContributorRewardTokenSpeedUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'contributor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardAccrued',
        type: 'uint256',
      },
    ],
    name: 'ContributorRewardsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardTokenDelta',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardTokenTotal',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardTokenBorrowIndex',
        type: 'uint256',
      },
    ],
    name: 'DistributedBorrowerRewardToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'supplier',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardTokenDelta',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardTokenTotal',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewardTokenSupplyIndex',
        type: 'uint256',
      },
    ],
    name: 'DistributedSupplierRewardToken',
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
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'MarketInitialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldMaxLoopsLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newmaxLoopsLimit',
        type: 'uint256',
      },
    ],
    name: 'MaxLoopsLimitUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldAccessControlManager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAccessControlManager',
        type: 'address',
      },
    ],
    name: 'NewAccessControlManager',
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
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'mantissa',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct ExponentialNoError.Exp',
        name: 'marketBorrowIndex',
        type: 'tuple',
      },
    ],
    name: 'RewardTokenBorrowIndexUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newSpeed',
        type: 'uint256',
      },
    ],
    name: 'RewardTokenBorrowSpeedUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RewardTokenGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'RewardTokenSupplyIndexUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newSpeed',
        type: 'uint256',
      },
    ],
    name: 'RewardTokenSupplySpeedUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newTimestamp',
        type: 'uint256',
      },
    ],
    name: 'SupplyLastRewardingBlockTimestampUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'newBlock',
        type: 'uint32',
      },
    ],
    name: 'SupplyLastRewardingBlockUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'INITIAL_INDEX',
    outputs: [
      {
        internalType: 'uint224',
        name: '',
        type: 'uint224',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'accessControlManager',
    outputs: [
      {
        internalType: 'contract IAccessControlManagerV8',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'blocksOrSecondsPerYear',
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
        name: 'holder',
        type: 'address',
      },
      {
        internalType: 'contract VToken[]',
        name: 'vTokens',
        type: 'address[]',
      },
    ],
    name: 'claimRewardToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
    ],
    name: 'claimRewardToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'mantissa',
            type: 'uint256',
          },
        ],
        internalType: 'struct ExponentialNoError.Exp',
        name: 'marketBorrowIndex',
        type: 'tuple',
      },
    ],
    name: 'distributeBorrowerRewardToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'supplier',
        type: 'address',
      },
    ],
    name: 'distributeSupplierRewardToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBlockNumberOrTimestamp',
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
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'grantRewardToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract Comptroller',
        name: 'comptroller_',
        type: 'address',
      },
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'rewardToken_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'loopsLimit_',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'accessControlManager_',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'initializeMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isTimeBased',
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
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastContributorBlock',
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
    name: 'maxLoopsLimit',
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
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rewardToken',
    outputs: [
      {
        internalType: 'contract IERC20Upgradeable',
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
    ],
    name: 'rewardTokenAccrued',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenBorrowSpeeds',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenBorrowState',
    outputs: [
      {
        internalType: 'uint224',
        name: 'index',
        type: 'uint224',
      },
      {
        internalType: 'uint32',
        name: 'block',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'lastRewardingBlock',
        type: 'uint32',
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
    ],
    name: 'rewardTokenBorrowStateTimeBased',
    outputs: [
      {
        internalType: 'uint224',
        name: 'index',
        type: 'uint224',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastRewardingTimestamp',
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
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenBorrowerIndex',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenContributorSpeeds',
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
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenSupplierIndex',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenSupplySpeeds',
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
        name: '',
        type: 'address',
      },
    ],
    name: 'rewardTokenSupplyState',
    outputs: [
      {
        internalType: 'uint224',
        name: 'index',
        type: 'uint224',
      },
      {
        internalType: 'uint32',
        name: 'block',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'lastRewardingBlock',
        type: 'uint32',
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
    ],
    name: 'rewardTokenSupplyStateTimeBased',
    outputs: [
      {
        internalType: 'uint224',
        name: 'index',
        type: 'uint224',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastRewardingTimestamp',
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
        name: 'accessControlManager_',
        type: 'address',
      },
    ],
    name: 'setAccessControlManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'contributor',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'rewardTokenSpeed',
        type: 'uint256',
      },
    ],
    name: 'setContributorRewardTokenSpeed',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract VToken[]',
        name: 'vTokens',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'supplyLastRewardingBlockTimestamps',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'borrowLastRewardingBlockTimestamps',
        type: 'uint256[]',
      },
    ],
    name: 'setLastRewardingBlockTimestamps',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract VToken[]',
        name: 'vTokens',
        type: 'address[]',
      },
      {
        internalType: 'uint32[]',
        name: 'supplyLastRewardingBlocks',
        type: 'uint32[]',
      },
      {
        internalType: 'uint32[]',
        name: 'borrowLastRewardingBlocks',
        type: 'uint32[]',
      },
    ],
    name: 'setLastRewardingBlocks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    name: 'setMaxLoopsLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract VToken[]',
        name: 'vTokens',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'supplySpeeds',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'borrowSpeeds',
        type: 'uint256[]',
      },
    ],
    name: 'setRewardTokenSpeeds',
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
        internalType: 'address',
        name: 'contributor',
        type: 'address',
      },
    ],
    name: 'updateContributorRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'mantissa',
            type: 'uint256',
          },
        ],
        internalType: 'struct ExponentialNoError.Exp',
        name: 'marketBorrowIndex',
        type: 'tuple',
      },
    ],
    name: 'updateRewardTokenBorrowIndex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'updateRewardTokenSupplyIndex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default VenusRewarderAbi;
