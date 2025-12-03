const CurvanceVault = [
  {
    inputs: [
      {
        internalType: 'contract ICentralRegistry',
        name: 'cr',
        type: 'address',
      },
      {
        internalType: 'contract IERC20',
        name: 'asset_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'mm',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'IRM_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AllowanceOverflow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AllowanceUnderflow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCTokenWithYield__InvalidVestingPeriod',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__InsufficientLiquidity',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__InvalidMarketManager',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__InvariantError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__TransferError',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__UnsupportedChain',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BaseCToken__ZeroAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowableCToken__CollateralPositionActive',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowableCToken__DebtPositionActive',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowableCToken__DepositsNotInitialized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowableCToken__InsufficientAssetsHeld',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BorrowableCToken__InvalidParameter',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CentralRegistryLib__InvalidCentralRegistry',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DepositMoreThanMax',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPermit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LowLevelCallsHelper__CallFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MintMoreThanMax',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Multicall__InvalidTarget',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Multicall__UnknownCalldata',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PermitExpired',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PluginDelegable_InvalidParameter',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PluginDelegable__DelegatingDisabled',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PluginDelegable__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RedeemMoreThanMax',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Reentrancy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TotalSupplyOverflow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WithdrawMoreThanMax',
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
        name: 'amount',
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
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
    ],
    name: 'BadDebtRecognized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'debtAssetsOwed',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Borrow',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'increased',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'CollateralUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newDebtAssets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'protocolFeeAssets',
        type: 'uint256',
      },
    ],
    name: 'DebtAccrued',
    type: 'event',
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
        name: 'delegate',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'approvalIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isApproved',
        type: 'bool',
      },
    ],
    name: 'DelegateApproval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'by',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
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
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'ExcessRecovered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assetsFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Flashloan',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Liquidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldIRM',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newIRM',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newVestingPeriod',
        type: 'uint256',
      },
    ],
    name: 'NewIRM',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldInterestFee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newInterestFee',
        type: 'uint256',
      },
    ],
    name: 'NewInterestFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'debtPerSecond',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nextAdjustment',
        type: 'uint256',
      },
    ],
    name: 'RatesAdjusted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'debtAssetsOwed',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'payer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Repay',
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
        name: 'amount',
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
        indexed: true,
        internalType: 'address',
        name: 'by',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'Withdraw',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'result',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'FLASHLOAN_FEE',
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
    name: 'IRM',
    outputs: [
      {
        internalType: 'contract IDynamicIRM',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_INTEREST_ACCRUAL_FEE',
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
    name: 'accrueIfNeeded',
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
        name: 'result',
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
    inputs: [],
    name: 'asset',
    outputs: [
      {
        internalType: 'address',
        name: 'result',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'assetsHeld',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
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
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
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
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'borrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'borrowFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract IBorrowableCToken',
            name: 'borrowableCToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'borrowAssets',
            type: 'uint256',
          },
          {
            internalType: 'contract ICToken',
            name: 'cToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'expectedShares',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'inputToken',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'inputAmount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'outputToken',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'slippage',
                type: 'uint256',
              },
              {
                internalType: 'bytes',
                name: 'call',
                type: 'bytes',
              },
            ],
            internalType: 'struct SwapperLib.Swap',
            name: 'swapAction',
            type: 'tuple',
          },
          {
            internalType: 'bytes',
            name: 'auxData',
            type: 'bytes',
          },
        ],
        internalType: 'struct IPositionManager.LeverageAction',
        name: 'action',
        type: 'tuple',
      },
    ],
    name: 'borrowForPositionManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'centralRegistry',
    outputs: [
      {
        internalType: 'contract ICentralRegistry',
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
        name: 'user',
        type: 'address',
      },
    ],
    name: 'checkNewDelegationDisabled',
    outputs: [
      {
        internalType: 'bool',
        name: 'result',
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
    name: 'collateralPosted',
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
    name: 'convertToAssets',
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
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'convertToShares',
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
    ],
    name: 'debtBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: 'r',
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
    ],
    name: 'debtBalanceUpdated',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
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
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'deposit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
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
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'depositAsCollateral',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
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
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'depositAsCollateralFor',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exchangeRate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'exchangeRateUpdated',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
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
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'flashFee',
    outputs: [
      {
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'flashLoan',
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
    name: 'getSnapshot',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'asset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'underlying',
            type: 'address',
          },
          {
            internalType: 'uint8',
            name: 'decimals',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isCollateral',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'collateralPosted',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'debtBalance',
            type: 'uint256',
          },
        ],
        internalType: 'struct AccountSnapshot',
        name: 'result',
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
        name: 'account',
        type: 'address',
      },
    ],
    name: 'getSnapshotUpdated',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'asset',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'underlying',
            type: 'address',
          },
          {
            internalType: 'uint8',
            name: 'decimals',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isCollateral',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'collateralPosted',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'debtBalance',
            type: 'uint256',
          },
        ],
        internalType: 'struct AccountSnapshot',
        name: 'result',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getYieldInformation',
    outputs: [
      {
        internalType: 'uint256',
        name: 'vestingRate',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vestingEnd',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'lastVestingClaim',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debtIndex',
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
        name: 'by',
        type: 'address',
      },
    ],
    name: 'initializeDeposits',
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
    inputs: [],
    name: 'interestFee',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isBorrowable',
    outputs: [
      {
        internalType: 'bool',
        name: 'result',
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
        name: 'user',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'delegate',
        type: 'address',
      },
    ],
    name: 'isDelegate',
    outputs: [
      {
        internalType: 'bool',
        name: 'result',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'collateralToken',
        type: 'address',
      },
    ],
    name: 'liquidate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'debtAmounts',
        type: 'uint256[]',
      },
      {
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'collateralToken',
        type: 'address',
      },
    ],
    name: 'liquidateExact',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketCollateralPosted',
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
    name: 'marketManager',
    outputs: [
      {
        internalType: 'contract IMarketManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketOutstandingDebt',
    outputs: [
      {
        internalType: 'uint240',
        name: '',
        type: 'uint240',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'marketOutstandingDebtUpdated',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
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
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'maxDeposit',
    outputs: [
      {
        internalType: 'uint256',
        name: 'maxAssets',
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
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'maxMint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'maxShares',
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
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'maxRedeem',
    outputs: [
      {
        internalType: 'uint256',
        name: 'maxShares',
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
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'maxWithdraw',
    outputs: [
      {
        internalType: 'uint256',
        name: 'maxAssets',
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
        name: 'receiver',
        type: 'address',
      },
    ],
    name: 'mint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
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
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'isPriceUpdate',
            type: 'bool',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Multicall.MulticallAction[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'multicall',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
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
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'nonces',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
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
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'permit',
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
    name: 'postCollateral',
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
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'postCollateralFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'previewDeposit',
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
    name: 'previewMint',
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
    name: 'previewRedeem',
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
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'previewWithdraw',
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
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'redeem',
    outputs: [
      {
        internalType: 'uint256',
        name: 'assets',
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
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'redeemCollateral',
    outputs: [
      {
        internalType: 'uint256',
        name: 'assets',
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
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'redeemCollateralFor',
    outputs: [
      {
        internalType: 'uint256',
        name: 'assets',
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
        name: 'shares',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'redeemFor',
    outputs: [
      {
        internalType: 'uint256',
        name: 'assets',
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
        name: 'shares',
        type: 'uint256',
      },
    ],
    name: 'removeCollateral',
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
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'removeCollateralFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
    ],
    name: 'repay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'repayFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'liquidatedShares',
        type: 'uint256[]',
      },
      {
        internalType: 'address',
        name: 'liquidator',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'accounts',
        type: 'address[]',
      },
    ],
    name: 'seize',
    outputs: [],
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
        name: 'isApproved',
        type: 'bool',
      },
    ],
    name: 'setDelegateApproval',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newIRM',
        type: 'address',
      },
    ],
    name: 'setIRM',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newInterestFee',
        type: 'uint256',
      },
    ],
    name: 'setInterestFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'skim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'skimAvailable',
    outputs: [
      {
        internalType: 'uint256',
        name: 'excess',
        type: 'uint256',
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
        name: 'result',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
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
    name: 'totalAssets',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
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
        name: 'result',
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
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'shares',
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
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'shares',
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
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'userApprovalIndex',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vestingPeriod',
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
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'withdraw',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
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
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'contract ICToken',
            name: 'cToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'collateralAssets',
            type: 'uint256',
          },
          {
            internalType: 'contract IBorrowableCToken',
            name: 'borrowableCToken',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'repayAssets',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'inputToken',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'inputAmount',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'outputToken',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'slippage',
                type: 'uint256',
              },
              {
                internalType: 'bytes',
                name: 'call',
                type: 'bytes',
              },
            ],
            internalType: 'struct SwapperLib.Swap[]',
            name: 'swapActions',
            type: 'tuple[]',
          },
          {
            internalType: 'bytes',
            name: 'auxData',
            type: 'bytes',
          },
        ],
        internalType: 'struct IPositionManager.DeleverageAction',
        name: 'action',
        type: 'tuple',
      },
    ],
    name: 'withdrawByPositionManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'withdrawCollateral',
    outputs: [
      {
        internalType: 'uint256',
        name: 'shares',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default CurvanceVault;
