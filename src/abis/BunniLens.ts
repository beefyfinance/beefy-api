export const BunniLens = [
  {
    inputs: [{ internalType: 'address', name: 'bunniToken', type: 'address' }],
    name: 'tokenBalances',
    outputs: [
      { internalType: 'uint256', name: 'amount0', type: 'uint256' },
      { internalType: 'uint256', name: 'amount1', type: 'uint256' },
      { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
export default BunniLens;
