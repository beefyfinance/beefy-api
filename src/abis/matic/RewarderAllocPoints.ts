const RewarderAllocPoints = [
  {
    inputs: [
      {
        internalType: 'contract IRewarder',
        name: 'rewarder',
        type: 'address',
      },
    ],
    name: 'totalAllocPoint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'total',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default RewarderAllocPoints;
