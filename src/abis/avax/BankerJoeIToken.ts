const BankerJoeIToken = [
  {
    type: 'constructor',
    stateMutability: 'nonpayable',
    payable: false,
    inputs: [
      {
        type: 'address',
        name: 'underlying_',
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'joetroller_',
        internalType: 'contract JoetrollerInterface',
      },
      {
        type: 'address',
        name: 'interestRateModel_',
        internalType: 'contract InterestRateModel',
      },
      {
        type: 'uint256',
        name: 'initialExchangeRateMantissa_',
        internalType: 'uint256',
      },
      {
        type: 'string',
        name: 'name_',
        internalType: 'string',
      },
      {
        type: 'string',
        name: 'symbol_',
        internalType: 'string',
      },
      {
        type: 'uint8',
        name: 'decimals_',
        internalType: 'uint8',
      },
      {
        type: 'address',
        name: 'admin_',
        internalType: 'address payable',
      },
      {
        type: 'address',
        name: 'implementation_',
        internalType: 'address',
      },
      {
        type: 'bytes',
        name: 'becomeImplementationData',
        internalType: 'bytes',
      },
    ],
  },
  {
    type: 'event',
    name: 'AccrueInterest',
    inputs: [
      {
        type: 'uint256',
        name: 'cashPrior',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'interestAccumulated',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'borrowIndex',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'totalBorrows',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'address',
        name: 'spender',
        internalType: 'address',
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
    name: 'Borrow',
    inputs: [
      {
        type: 'address',
        name: 'borrower',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'borrowAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'accountBorrows',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'totalBorrows',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Failure',
    inputs: [
      {
        type: 'uint256',
        name: 'error',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'info',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'detail',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Flashloan',
    inputs: [
      {
        type: 'address',
        name: 'receiver',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'totalFee',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'reservesFee',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiquidateBorrow',
    inputs: [
      {
        type: 'address',
        name: 'liquidator',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'borrower',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'repayAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'address',
        name: 'jTokenCollateral',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'seizeTokens',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Mint',
    inputs: [
      {
        type: 'address',
        name: 'minter',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'mintAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'mintTokens',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewAdmin',
    inputs: [
      {
        type: 'address',
        name: 'oldAdmin',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newAdmin',
        internalType: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewCollateralCap',
    inputs: [
      {
        type: 'address',
        name: 'token',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newCap',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewImplementation',
    inputs: [
      {
        type: 'address',
        name: 'oldImplementation',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newImplementation',
        internalType: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewJoetroller',
    inputs: [
      {
        type: 'address',
        name: 'oldJoetroller',
        internalType: 'contract JoetrollerInterface',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newJoetroller',
        internalType: 'contract JoetrollerInterface',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewMarketInterestRateModel',
    inputs: [
      {
        type: 'address',
        name: 'oldInterestRateModel',
        internalType: 'contract InterestRateModel',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newInterestRateModel',
        internalType: 'contract InterestRateModel',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewPendingAdmin',
    inputs: [
      {
        type: 'address',
        name: 'oldPendingAdmin',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'newPendingAdmin',
        internalType: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewReserveFactor',
    inputs: [
      {
        type: 'uint256',
        name: 'oldReserveFactorMantissa',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newReserveFactorMantissa',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Redeem',
    inputs: [
      {
        type: 'address',
        name: 'redeemer',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'redeemAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'redeemTokens',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RepayBorrow',
    inputs: [
      {
        type: 'address',
        name: 'payer',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'address',
        name: 'borrower',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'repayAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'accountBorrows',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'totalBorrows',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ReservesAdded',
    inputs: [
      {
        type: 'address',
        name: 'benefactor',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'addAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newTotalReserves',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ReservesReduced',
    inputs: [
      {
        type: 'address',
        name: 'admin',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'reduceAmount',
        internalType: 'uint256',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newTotalReserves',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        type: 'address',
        name: 'from',
        internalType: 'address',
        indexed: true,
      },
      {
        type: 'address',
        name: 'to',
        internalType: 'address',
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
    name: 'UserCollateralChanged',
    inputs: [
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
        indexed: false,
      },
      {
        type: 'uint256',
        name: 'newCollateralTokens',
        internalType: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'fallback',
    stateMutability: 'payable',
    payable: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_acceptAdmin',
    inputs: [],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_addReserves',
    inputs: [
      {
        type: 'uint256',
        name: 'addAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_reduceReserves',
    inputs: [
      {
        type: 'uint256',
        name: 'reduceAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [],
    name: '_setCollateralCap',
    inputs: [
      {
        type: 'uint256',
        name: 'newCollateralCap',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [],
    name: '_setImplementation',
    inputs: [
      {
        type: 'address',
        name: 'implementation_',
        internalType: 'address',
      },
      {
        type: 'bool',
        name: 'allowResign',
        internalType: 'bool',
      },
      {
        type: 'bytes',
        name: 'becomeImplementationData',
        internalType: 'bytes',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_setInterestRateModel',
    inputs: [
      {
        type: 'address',
        name: 'newInterestRateModel',
        internalType: 'contract InterestRateModel',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_setJoetroller',
    inputs: [
      {
        type: 'address',
        name: 'newJoetroller',
        internalType: 'contract JoetrollerInterface',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_setPendingAdmin',
    inputs: [
      {
        type: 'address',
        name: 'newPendingAdmin',
        internalType: 'address payable',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: '_setReserveFactor',
    inputs: [
      {
        type: 'uint256',
        name: 'newReserveFactorMantissa',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'accountCollateralTokens',
    inputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'accrualBlockTimestamp',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'accrueInterest',
    inputs: [],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address payable',
      },
    ],
    name: 'admin',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'allowance',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'spender',
        internalType: 'address',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'approve',
    inputs: [
      {
        type: 'address',
        name: 'spender',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'balanceOf',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        internalType: 'address',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'balanceOfUnderlying',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        internalType: 'address',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'borrow',
    inputs: [
      {
        type: 'uint256',
        name: 'borrowAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'borrowBalanceCurrent',
    inputs: [
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'borrowBalanceStored',
    inputs: [
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'borrowIndex',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'borrowRatePerSecond',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'collateralCap',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint8',
        name: '',
        internalType: 'uint8',
      },
    ],
    name: 'decimals',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'bytes',
        name: '',
        internalType: 'bytes',
      },
    ],
    name: 'delegateToImplementation',
    inputs: [
      {
        type: 'bytes',
        name: 'data',
        internalType: 'bytes',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'bytes',
        name: '',
        internalType: 'bytes',
      },
    ],
    name: 'delegateToViewImplementation',
    inputs: [
      {
        type: 'bytes',
        name: 'data',
        internalType: 'bytes',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'exchangeRateCurrent',
    inputs: [],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'exchangeRateStored',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'flashFeeBips',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'flashLoan',
    inputs: [
      {
        type: 'address',
        name: 'receiver',
        internalType: 'contract ERC3156FlashBorrowerInterface',
      },
      {
        type: 'address',
        name: 'initiator',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
      {
        type: 'bytes',
        name: 'data',
        internalType: 'bytes',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'getAccountSnapshot',
    inputs: [
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'getCash',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [],
    name: 'gulp',
    inputs: [],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    name: 'implementation',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'contract InterestRateModel',
      },
    ],
    name: 'interestRateModel',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'internalCash',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'isCollateralTokenInit',
    inputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'isJToken',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'contract JoetrollerInterface',
      },
    ],
    name: 'joetroller',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'liquidateBorrow',
    inputs: [
      {
        type: 'address',
        name: 'borrower',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'repayAmount',
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'jTokenCollateral',
        internalType: 'contract JTokenInterface',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'mint',
    inputs: [
      {
        type: 'uint256',
        name: 'mintAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'string',
        name: '',
        internalType: 'string',
      },
    ],
    name: 'name',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address payable',
      },
    ],
    name: 'pendingAdmin',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'redeem',
    inputs: [
      {
        type: 'uint256',
        name: 'redeemTokens',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'redeemUnderlying',
    inputs: [
      {
        type: 'uint256',
        name: 'redeemAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'registerCollateral',
    inputs: [
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'repayBorrow',
    inputs: [
      {
        type: 'uint256',
        name: 'repayAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'repayBorrowBehalf',
    inputs: [
      {
        type: 'address',
        name: 'borrower',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'repayAmount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'reserveFactorMantissa',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'seize',
    inputs: [
      {
        type: 'address',
        name: 'liquidator',
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'borrower',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'seizeTokens',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'supplyRatePerSecond',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'string',
        name: '',
        internalType: 'string',
      },
    ],
    name: 'symbol',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalBorrows',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalBorrowsCurrent',
    inputs: [],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalCollateralTokens',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalReserves',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'uint256',
        name: '',
        internalType: 'uint256',
      },
    ],
    name: 'totalSupply',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'transfer',
    inputs: [
      {
        type: 'address',
        name: 'dst',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [
      {
        type: 'bool',
        name: '',
        internalType: 'bool',
      },
    ],
    name: 'transferFrom',
    inputs: [
      {
        type: 'address',
        name: 'src',
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'dst',
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'amount',
        internalType: 'uint256',
      },
    ],
    constant: false,
  },
  {
    type: 'function',
    stateMutability: 'view',
    payable: false,
    outputs: [
      {
        type: 'address',
        name: '',
        internalType: 'address',
      },
    ],
    name: 'underlying',
    inputs: [],
    constant: true,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    payable: false,
    outputs: [],
    name: 'unregisterCollateral',
    inputs: [
      {
        type: 'address',
        name: 'account',
        internalType: 'address',
      },
    ],
    constant: false,
  },
] as const;

export default BankerJoeIToken;
