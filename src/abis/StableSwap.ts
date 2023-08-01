const StableSwap = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'calculateSwap',
    inputs: [
      { name: 'tokenIndexFrom', type: 'uint8' },
      { name: 'tokenIndexTo', type: 'uint8' },
      { name: 'dx', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export default StableSwap;
