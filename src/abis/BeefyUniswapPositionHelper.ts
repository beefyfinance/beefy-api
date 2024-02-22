const BeefyUniswapPositionHelperAbi = [
  {
    inputs: [
      { internalType: 'uint256', name: 'posId', type: 'uint256' },
      { internalType: 'address', name: 'lpToken', type: 'address' },
      { internalType: 'address', name: 'nftManager', type: 'address' },
    ],
    name: 'getPositionTokens',
    outputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint128', name: '', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default BeefyUniswapPositionHelperAbi;
