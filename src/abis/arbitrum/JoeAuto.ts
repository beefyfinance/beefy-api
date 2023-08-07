const JoeAuto = [
  {
    inputs: [
      {
        internalType: 'contract IVaultFactory',
        name: 'factory',
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
        name: 'user',
        type: 'address',
      },
    ],
    name: 'BaseVault__AlreadyWhitelisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__BurnMinShares',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__DepositsPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__InvalidNativeAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__InvalidRecipient',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__InvalidRound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__InvalidShares',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__InvalidStrategy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__InvalidToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__MaxSharesExceeded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__NativeTransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__NoNativeToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__NoQueuedWithdrawal',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__NotInEmergencyMode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'BaseVault__NotWhitelisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__OnlyFactory',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__OnlyStrategy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__OnlyWNative',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__SameStrategy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__SameWhitelistState',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__ZeroAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseVault__ZeroShares',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OracleVault__InvalidPrice',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OracleVault__StalePrice',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Uint256x256Math__MulDivOverflow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Uint256x256Math__MulShiftOverflow',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
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
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'DepositsPaused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'DepositsResumed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'EmergencyMode',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'EmergencyWithdrawal',
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
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
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
    name: 'Recovered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'contract IStrategy',
        name: 'strategy',
        type: 'address',
      },
    ],
    name: 'StrategySet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
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
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'WhitelistAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'WhitelistRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'state',
        type: 'bool',
      },
    ],
    name: 'WhitelistStateChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalQueuedQhares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalQueued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalRedeemed',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'addToWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'allowance',
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
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
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
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'cancelQueuedWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'effectiveX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'effectiveY',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'depositNative',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'effectiveX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'effectiveY',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'executeQueuedWithdrawals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAumAnnualFee',
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
    name: 'getBalances',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentRound',
    outputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentTotalQueuedWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalQueuedShares',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFactory',
    outputs: [
      {
        internalType: 'contract IVaultFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOperators',
    outputs: [
      {
        internalType: 'address',
        name: 'defaultOperator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOracleX',
    outputs: [
      {
        internalType: 'contract IAggregatorV3',
        name: 'oracleX',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOracleY',
    outputs: [
      {
        internalType: 'contract IAggregatorV3',
        name: 'oracleY',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPair',
    outputs: [
      {
        internalType: 'contract ILBPair',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: 'price',
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
        name: 'round',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getQueuedWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRange',
    outputs: [
      {
        internalType: 'uint24',
        name: 'low',
        type: 'uint24',
      },
      {
        internalType: 'uint24',
        name: 'upper',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getRedeemableAmounts',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStrategy',
    outputs: [
      {
        internalType: 'contract IStrategy',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenX',
    outputs: [
      {
        internalType: 'contract IERC20Upgradeable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenY',
    outputs: [
      {
        internalType: 'contract IERC20Upgradeable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
    ],
    name: 'getTotalQueuedWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalQueuedShares',
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
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
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
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isDepositsPaused',
    outputs: [
      {
        internalType: 'bool',
        name: 'paused',
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
        name: 'user',
        type: 'address',
      },
    ],
    name: 'isWhitelisted',
    outputs: [
      {
        internalType: 'bool',
        name: 'whitelisted',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isWhitelistedOnly',
    outputs: [
      {
        internalType: 'bool',
        name: 'whitelist',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'previewAmounts',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
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
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    name: 'previewShares',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'effectiveX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'effectiveY',
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
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'queueWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20Upgradeable',
        name: 'token',
        type: 'address',
      },
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
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'redeemQueuedWithdrawal',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'round',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'redeemQueuedWithdrawalNative',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountX',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountY',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    name: 'removeFromWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resumeDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'setEmergencyMode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IStrategy',
        name: 'newStrategy',
        type: 'address',
      },
    ],
    name: 'setStrategy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'state',
        type: 'bool',
      },
    ],
    name: 'setWhitelistState',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
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
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
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
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

export default JoeAuto;
