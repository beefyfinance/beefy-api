const ICurvePool = [
  {
    name: 'TokenExchange',
    inputs: [
      {
        name: 'buyer',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sold_id',
        type: 'int128',
        indexed: false,
      },
      {
        name: 'tokens_sold',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bought_id',
        type: 'int128',
        indexed: false,
      },
      {
        name: 'tokens_bought',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'TokenExchangeUnderlying',
    inputs: [
      {
        name: 'buyer',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sold_id',
        type: 'int128',
        indexed: false,
      },
      {
        name: 'tokens_sold',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bought_id',
        type: 'int128',
        indexed: false,
      },
      {
        name: 'tokens_bought',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'AddLiquidity',
    inputs: [
      {
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token_amounts',
        type: 'uint256[3]',
        indexed: false,
      },
      {
        name: 'fees',
        type: 'uint256[3]',
        indexed: false,
      },
      {
        name: 'invariant',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token_supply',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'RemoveLiquidity',
    inputs: [
      {
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token_amounts',
        type: 'uint256[3]',
        indexed: false,
      },
      {
        name: 'fees',
        type: 'uint256[3]',
        indexed: false,
      },
      {
        name: 'token_supply',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'RemoveLiquidityOne',
    inputs: [
      {
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token_amount',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'coin_amount',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'RemoveLiquidityImbalance',
    inputs: [
      {
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token_amounts',
        type: 'uint256[3]',
        indexed: false,
      },
      {
        name: 'fees',
        type: 'uint256[3]',
        indexed: false,
      },
      {
        name: 'invariant',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token_supply',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'CommitNewAdmin',
    inputs: [
      {
        name: 'deadline',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'admin',
        type: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'NewAdmin',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'CommitNewFee',
    inputs: [
      {
        name: 'deadline',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'fee',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'admin_fee',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'offpeg_fee_multiplier',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'NewFee',
    inputs: [
      {
        name: 'fee',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'admin_fee',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'offpeg_fee_multiplier',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'RampA',
    inputs: [
      {
        name: 'old_A',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'new_A',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'initial_time',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'future_time',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'StopRampA',
    inputs: [
      {
        name: 'A',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 't',
        type: 'uint256',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: '_coins',
        type: 'address[3]',
      },
      {
        name: '_underlying_coins',
        type: 'address[3]',
      },
      {
        name: '_pool_token',
        type: 'address',
      },
      {
        name: '_A',
        type: 'uint256',
      },
      {
        name: '_fee',
        type: 'uint256',
      },
      {
        name: '_admin_fee',
        type: 'uint256',
      },
      {
        name: '_offpeg_fee_multiplier',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'A',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 10374,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'A_precise',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 10336,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'dynamic_fee',
    inputs: [
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: 'j',
        type: 'int128',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 22113,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'balances',
    inputs: [
      {
        name: 'i',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 7358,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_virtual_price',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2702067,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'lp_price',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'calc_token_amount',
    inputs: [
      {
        name: '_amounts',
        type: 'uint256[3]',
      },
      {
        name: 'is_deposit',
        type: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 5368162,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'add_liquidity',
    inputs: [
      {
        name: '_amounts',
        type: 'uint256[3]',
      },
      {
        name: '_min_mint_amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'add_liquidity',
    inputs: [
      {
        name: '_amounts',
        type: 'uint256[3]',
      },
      {
        name: '_min_mint_amount',
        type: 'uint256',
      },
      {
        name: '_use_underlying',
        type: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_dy',
    inputs: [
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: 'j',
        type: 'int128',
      },
      {
        name: 'dx',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 6289374,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_dy_underlying',
    inputs: [
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: 'j',
        type: 'int128',
      },
      {
        name: 'dx',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 6289404,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'exchange',
    inputs: [
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: 'j',
        type: 'int128',
      },
      {
        name: 'dx',
        type: 'uint256',
      },
      {
        name: 'min_dy',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 6465508,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'exchange_underlying',
    inputs: [
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: 'j',
        type: 'int128',
      },
      {
        name: 'dx',
        type: 'uint256',
      },
      {
        name: 'min_dy',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 6484358,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_liquidity',
    inputs: [
      {
        name: '_amount',
        type: 'uint256',
      },
      {
        name: '_min_amounts',
        type: 'uint256[3]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[3]',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_liquidity',
    inputs: [
      {
        name: '_amount',
        type: 'uint256',
      },
      {
        name: '_min_amounts',
        type: 'uint256[3]',
      },
      {
        name: '_use_underlying',
        type: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[3]',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_liquidity_imbalance',
    inputs: [
      {
        name: '_amounts',
        type: 'uint256[3]',
      },
      {
        name: '_max_burn_amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_liquidity_imbalance',
    inputs: [
      {
        name: '_amounts',
        type: 'uint256[3]',
      },
      {
        name: '_max_burn_amount',
        type: 'uint256',
      },
      {
        name: '_use_underlying',
        type: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'calc_withdraw_one_coin',
    inputs: [
      {
        name: '_token_amount',
        type: 'uint256',
      },
      {
        name: 'i',
        type: 'int128',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 4491030,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_liquidity_one_coin',
    inputs: [
      {
        name: '_token_amount',
        type: 'uint256',
      },
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: '_min_amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_liquidity_one_coin',
    inputs: [
      {
        name: '_token_amount',
        type: 'uint256',
      },
      {
        name: 'i',
        type: 'int128',
      },
      {
        name: '_min_amount',
        type: 'uint256',
      },
      {
        name: '_use_underlying',
        type: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'ramp_A',
    inputs: [
      {
        name: '_future_A',
        type: 'uint256',
      },
      {
        name: '_future_time',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 159459,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'stop_ramp_A',
    inputs: [],
    outputs: [],
    gas: 154920,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'commit_new_fee',
    inputs: [
      {
        name: 'new_fee',
        type: 'uint256',
      },
      {
        name: 'new_admin_fee',
        type: 'uint256',
      },
      {
        name: 'new_offpeg_fee_multiplier',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 148809,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'apply_new_fee',
    inputs: [],
    outputs: [],
    gas: 141271,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revert_new_parameters',
    inputs: [],
    outputs: [],
    gas: 23012,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'commit_transfer_ownership',
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 77050,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'apply_transfer_ownership',
    inputs: [],
    outputs: [],
    gas: 65727,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revert_transfer_ownership',
    inputs: [],
    outputs: [],
    gas: 23102,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'withdraw_admin_fees',
    inputs: [],
    outputs: [],
    gas: 90981,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'donate_admin_fees',
    inputs: [],
    outputs: [],
    gas: 63303,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'kill_me',
    inputs: [],
    outputs: [],
    gas: 40385,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'unkill_me',
    inputs: [],
    outputs: [],
    gas: 23222,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_aave_referral',
    inputs: [
      {
        name: 'referral_code',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 38352,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_reward_receiver',
    inputs: [
      {
        name: '_reward_receiver',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 38385,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_admin_fee_receiver',
    inputs: [
      {
        name: '_admin_fee_receiver',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 38415,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'coins',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3397,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'underlying_coins',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3427,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'admin_balances',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3457,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'fee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3378,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'offpeg_fee_multiplier',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3408,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'admin_fee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3438,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3468,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'lp_token',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3498,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'initial_A',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3528,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_A',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3558,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'initial_A_time',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3588,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_A_time',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3618,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'admin_actions_deadline',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3648,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'transfer_ownership_deadline',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3678,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_fee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3708,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_admin_fee',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3738,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_offpeg_fee_multiplier',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3768,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3798,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_receiver',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3828,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'admin_fee_receiver',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3858,
  },
] as const;

export default ICurvePool;
