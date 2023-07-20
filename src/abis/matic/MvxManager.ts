const MvxManagerAbi = [
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'maximise',
        type: 'bool',
      },
    ],
    name: 'getAumInUsdm',
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
] as const;

export default MvxManagerAbi;
