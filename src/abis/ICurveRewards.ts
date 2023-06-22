const ICurveRewards = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'add_reward',
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_distributor',
        type: 'address',
      },
      {
        name: '_duration',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 147850,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_reward',
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 898282,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_receiver',
    inputs: [
      {
        name: '_receiver',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 37605,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'get_reward',
    inputs: [],
    outputs: [],
    gas: 496490,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'notify_reward_amount',
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 1502780,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_reward_duration',
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_duration',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 40303,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_reward_distributor',
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_distributor',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 38012,
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
    gas: 37755,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'accept_transfer_ownership',
    inputs: [],
    outputs: [],
    gas: 37700,
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
    gas: 2658,
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
    gas: 2688,
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
    gas: 2718,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_tokens',
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
    gas: 2857,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2778,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_data',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: 'distributor',
        type: 'address',
      },
      {
        name: 'period_finish',
        type: 'uint256',
      },
      {
        name: 'rate',
        type: 'uint256',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
      {
        name: 'received',
        type: 'uint256',
      },
      {
        name: 'paid',
        type: 'uint256',
      },
    ],
    gas: 14685,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'last_update_time',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2838,
  },
] as const;

export default ICurveRewards;
