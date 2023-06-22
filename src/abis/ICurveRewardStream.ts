const ICurveRewardStream = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_distributor',
        type: 'address',
      },
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
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'add_receiver',
    inputs: [
      {
        name: '_receiver',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 194256,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'remove_receiver',
    inputs: [
      {
        name: '_receiver',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 171334,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'get_reward',
    inputs: [],
    outputs: [],
    gas: 126649,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'notify_reward_amount',
    inputs: [
      {
        name: '_amount',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 203319,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_reward_duration',
    inputs: [
      {
        name: '_duration',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 39758,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_reward_distributor',
    inputs: [
      {
        name: '_distributor',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 37695,
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
    gas: 37725,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'accept_transfer_ownership',
    inputs: [],
    outputs: [],
    gas: 37670,
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
    gas: 2628,
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
    gas: 2658,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'distributor',
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
    name: 'reward_token',
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
    name: 'period_finish',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2748,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_rate',
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
    name: 'reward_duration',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2808,
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
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_per_receiver_total',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2868,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'receiver_count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2898,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'reward_receivers',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    gas: 3143,
  },
] as const;

export default ICurveRewardStream;
