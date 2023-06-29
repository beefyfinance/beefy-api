const IMarkets = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'underlying',
        type: 'address',
      },
    ],
    name: 'interestRate',
    outputs: [
      {
        internalType: 'int96',
        name: '',
        type: 'int96',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default IMarkets;
