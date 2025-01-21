const VenusComptrollerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'poolRegistry_',
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
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'enum Action',
        name: 'action',
        type: 'uint8',
      },
    ],
    name: 'ActionPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowActionNotPaused',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'cap',
        type: 'uint256',
      },
    ],
    name: 'BorrowCapExceeded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowCapIsNotZero',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'expectedLessThanOrEqualTo',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'actual',
        type: 'uint256',
      },
    ],
    name: 'CollateralExceedsThreshold',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CollateralFactorIsNotZero',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ComptrollerMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DelegationStatusUnchanged',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EnterMarketActionNotPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExitMarketActionNotPaused',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'collateralToSeize',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'availableCollateral',
        type: 'uint256',
      },
    ],
    name: 'InsufficientCollateral',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientLiquidity',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientShortfall',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCollateralFactor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLiquidationThreshold',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LiquidateActionNotPaused',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'MarketAlreadyListed',
    type: 'error',
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
        name: 'user',
        type: 'address',
      },
    ],
    name: 'MarketNotCollateral',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'MarketNotListed',
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
        internalType: 'uint256',
        name: 'expectedGreaterThan',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'actual',
        type: 'uint256',
      },
    ],
    name: 'MinimalCollateralViolated',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MintActionNotPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NonzeroBorrowBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'PriceError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RedeemActionNotPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RepayActionNotPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SeizeActionNotPaused',
    type: 'error',
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
        name: 'user',
        type: 'address',
      },
    ],
    name: 'SnapshotError',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'cap',
        type: 'uint256',
      },
    ],
    name: 'SupplyCapExceeded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SupplyCapIsNotZero',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TooMuchRepay',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TransferActionNotPaused',
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
    inputs: [
      {
        internalType: 'address',
        name: 'expectedSender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'actualSender',
        type: 'address',
      },
    ],
    name: 'UnexpectedSender',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddressNotAllowed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum Action',
        name: 'action',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'pauseState',
        type: 'bool',
      },
    ],
    name: 'ActionPausedMarket',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'approver',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'DelegateUpdated',
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
      {
        indexed: false,
        internalType: 'bool',
        name: 'enable',
        type: 'bool',
      },
    ],
    name: 'IsForcedLiquidationEnabledUpdated',
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
        name: 'account',
        type: 'address',
      },
    ],
    name: 'MarketEntered',
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
        name: 'account',
        type: 'address',
      },
    ],
    name: 'MarketExited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'MarketSupported',
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
    name: 'MarketUnlisted',
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
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newBorrowCap',
        type: 'uint256',
      },
    ],
    name: 'NewBorrowCap',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldCloseFactorMantissa',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newCloseFactorMantissa',
        type: 'uint256',
      },
    ],
    name: 'NewCloseFactor',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldCollateralFactorMantissa',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newCollateralFactorMantissa',
        type: 'uint256',
      },
    ],
    name: 'NewCollateralFactor',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldLiquidationIncentiveMantissa',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newLiquidationIncentiveMantissa',
        type: 'uint256',
      },
    ],
    name: 'NewLiquidationIncentive',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldLiquidationThresholdMantissa',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newLiquidationThresholdMantissa',
        type: 'uint256',
      },
    ],
    name: 'NewLiquidationThreshold',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldMinLiquidatableCollateral',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newMinLiquidatableCollateral',
        type: 'uint256',
      },
    ],
    name: 'NewMinLiquidatableCollateral',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract ResilientOracleInterface',
        name: 'oldPriceOracle',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract ResilientOracleInterface',
        name: 'newPriceOracle',
        type: 'address',
      },
    ],
    name: 'NewPriceOracle',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IPrime',
        name: 'oldPrimeToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'contract IPrime',
        name: 'newPrimeToken',
        type: 'address',
      },
    ],
    name: 'NewPrimeToken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardsDistributor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'rewardToken',
        type: 'address',
      },
    ],
    name: 'NewRewardsDistributor',
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
        name: 'newSupplyCap',
        type: 'uint256',
      },
    ],
    name: 'NewSupplyCap',
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
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'accountAssets',
    outputs: [
      {
        internalType: 'contract VToken',
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
        name: 'market',
        type: 'address',
      },
      {
        internalType: 'enum Action',
        name: 'action',
        type: 'uint8',
      },
    ],
    name: 'actionPaused',
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
        internalType: 'contract RewardsDistributor',
        name: '_rewardsDistributor',
        type: 'address',
      },
    ],
    name: 'addRewardsDistributor',
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
    name: 'allMarkets',
    outputs: [
      {
        internalType: 'contract VToken',
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
    name: 'approvedDelegates',
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
    name: 'borrowCaps',
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
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'borrowAmount',
        type: 'uint256',
      },
    ],
    name: 'borrowVerify',
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
      {
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'checkMembership',
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
    name: 'closeFactorMantissa',
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
        internalType: 'address[]',
        name: 'vTokens',
        type: 'address[]',
      },
    ],
    name: 'enterMarkets',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
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
        name: 'vTokenAddress',
        type: 'address',
      },
    ],
    name: 'exitMarket',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
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
    name: 'getAccountLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'error',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'shortfall',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllMarkets',
    outputs: [
      {
        internalType: 'contract VToken[]',
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
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getAssetsIn',
    outputs: [
      {
        internalType: 'contract VToken[]',
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
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getBorrowingPower',
    outputs: [
      {
        internalType: 'uint256',
        name: 'error',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'shortfall',
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
        name: 'vTokenModify',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'redeemTokens',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'borrowAmount',
        type: 'uint256',
      },
    ],
    name: 'getHypotheticalAccountLiquidity',
    outputs: [
      {
        internalType: 'uint256',
        name: 'error',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidity',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'shortfall',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRewardDistributors',
    outputs: [
      {
        internalType: 'contract RewardsDistributor[]',
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
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'getRewardsByMarket',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'rewardToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'supplySpeed',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'borrowSpeed',
            type: 'uint256',
          },
        ],
        internalType: 'struct ComptrollerStorage.RewardSpeeds[]',
        name: 'rewardSpeeds',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'healAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'loopLimit',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'accessControlManager',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isComptroller',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
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
    name: 'isForcedLiquidationEnabled',
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
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'isMarketListed',
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
        name: 'borrower',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract VToken',
            name: 'vTokenCollateral',
            type: 'address',
          },
          {
            internalType: 'contract VToken',
            name: 'vTokenBorrowed',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'repayAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct ComptrollerStorage.LiquidationOrder[]',
        name: 'orders',
        type: 'tuple[]',
      },
    ],
    name: 'liquidateAccount',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vTokenBorrowed',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'vTokenCollateral',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'actualRepayAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'seizeTokens',
        type: 'uint256',
      },
    ],
    name: 'liquidateBorrowVerify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vTokenBorrowed',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'vTokenCollateral',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'actualRepayAmount',
        type: 'uint256',
      },
    ],
    name: 'liquidateCalculateSeizeTokens',
    outputs: [
      {
        internalType: 'uint256',
        name: 'error',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'tokensToSeize',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidationIncentiveMantissa',
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
    name: 'markets',
    outputs: [
      {
        internalType: 'bool',
        name: 'isListed',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'collateralFactorMantissa',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liquidationThresholdMantissa',
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
    name: 'minLiquidatableCollateral',
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
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'actualMintAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'mintTokens',
        type: 'uint256',
      },
    ],
    name: 'mintVerify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracle',
    outputs: [
      {
        internalType: 'contract ResilientOracleInterface',
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
    inputs: [],
    name: 'poolRegistry',
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
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'borrowAmount',
        type: 'uint256',
      },
    ],
    name: 'preBorrowHook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vTokenBorrowed',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'vTokenCollateral',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'repayAmount',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'skipLiquidityCheck',
        type: 'bool',
      },
    ],
    name: 'preLiquidateHook',
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
        name: 'minter',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'mintAmount',
        type: 'uint256',
      },
    ],
    name: 'preMintHook',
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
        name: 'redeemer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'redeemTokens',
        type: 'uint256',
      },
    ],
    name: 'preRedeemHook',
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
    ],
    name: 'preRepayHook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vTokenCollateral',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'seizerContract',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
    ],
    name: 'preSeizeHook',
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
        name: 'src',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'dst',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'transferTokens',
        type: 'uint256',
      },
    ],
    name: 'preTransferHook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'prime',
    outputs: [
      {
        internalType: 'contract IPrime',
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
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'redeemer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'redeemAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'redeemTokens',
        type: 'uint256',
      },
    ],
    name: 'redeemVerify',
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
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'payer',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'actualRepayAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'borrowerIndex',
        type: 'uint256',
      },
    ],
    name: 'repayBorrowVerify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vTokenCollateral',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'vTokenBorrowed',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'seizeTokens',
        type: 'uint256',
      },
    ],
    name: 'seizeVerify',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'contract VToken[]',
        name: 'marketsList',
        type: 'address[]',
      },
      {
        internalType: 'enum Action[]',
        name: 'actionsList',
        type: 'uint8[]',
      },
      {
        internalType: 'bool',
        name: 'paused',
        type: 'bool',
      },
    ],
    name: 'setActionsPaused',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newCloseFactorMantissa',
        type: 'uint256',
      },
    ],
    name: 'setCloseFactor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'newCollateralFactorMantissa',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newLiquidationThresholdMantissa',
        type: 'uint256',
      },
    ],
    name: 'setCollateralFactor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vTokenBorrowed',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'enable',
        type: 'bool',
      },
    ],
    name: 'setForcedLiquidation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newLiquidationIncentiveMantissa',
        type: 'uint256',
      },
    ],
    name: 'setLiquidationIncentive',
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
        name: 'newBorrowCaps',
        type: 'uint256[]',
      },
    ],
    name: 'setMarketBorrowCaps',
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
        name: 'newSupplyCaps',
        type: 'uint256[]',
      },
    ],
    name: 'setMarketSupplyCaps',
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
        internalType: 'uint256',
        name: 'newMinLiquidatableCollateral',
        type: 'uint256',
      },
    ],
    name: 'setMinLiquidatableCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ResilientOracleInterface',
        name: 'newOracle',
        type: 'address',
      },
    ],
    name: 'setPriceOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IPrime',
        name: '_prime',
        type: 'address',
      },
    ],
    name: 'setPrimeToken',
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
    name: 'supplyCaps',
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
        internalType: 'contract VToken',
        name: 'vToken',
        type: 'address',
      },
    ],
    name: 'supportMarket',
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
        name: 'vToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'src',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'dst',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'transferTokens',
        type: 'uint256',
      },
    ],
    name: 'transferVerify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'market',
        type: 'address',
      },
    ],
    name: 'unlistMarket',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'approved',
        type: 'bool',
      },
    ],
    name: 'updateDelegate',
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
    name: 'updatePrices',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default VenusComptrollerAbi;
