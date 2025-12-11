const CurvanceIRM = [
  {
    inputs: [
      {
        internalType: 'contract ICentralRegistry',
        name: 'cr',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'baseRatePerYear',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vertexRatePerYear',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vertexStart',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'adjustmentVelocity',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'decayPerAdjustment',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vertexMultiplierMax',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'CentralRegistryLib__InvalidCentralRegistry',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__InvalidAdjustmentVelocity',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__InvalidDecayRate',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__InvalidInterestRatePerYear',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__InvalidMultiplierMax',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__InvalidToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__InvalidUtilizationStart',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DynamicIRM__Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'baseRatePerSecond',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'vertexRatePerSecond',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'vertexStart',
            type: 'uint64',
          },
          {
            internalType: 'uint24',
            name: 'increaseThresholdStart',
            type: 'uint24',
          },
          {
            internalType: 'uint24',
            name: 'decreaseThresholdEnd',
            type: 'uint24',
          },
          {
            internalType: 'uint16',
            name: 'adjustmentVelocity',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'decayPerAdjustment',
            type: 'uint16',
          },
          {
            internalType: 'uint80',
            name: 'vertexMultiplierMax',
            type: 'uint80',
          },
          {
            internalType: 'address',
            name: 'linkedToken',
            type: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct DynamicIRM.RatesConfig',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'NewIRM',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'borrowableCToken',
        type: 'address',
      },
    ],
    name: 'TokenLinked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'ADJUSTMENT_RATE',
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
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetsHeld',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debt',
        type: 'uint256',
      },
    ],
    name: 'adjustedBorrowRate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'ratePerSecond',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'adjustmentRate',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetsHeld',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debt',
        type: 'uint256',
      },
    ],
    name: 'borrowRate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'r',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'centralRegistry',
    outputs: [
      {
        internalType: 'contract ICentralRegistry',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'linkedToken',
    outputs: [
      {
        internalType: 'address',
        name: 'result',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetsHeld',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debt',
        type: 'uint256',
      },
    ],
    name: 'predictedBorrowRate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ratesConfig',
    outputs: [
      {
        internalType: 'uint64',
        name: 'baseRatePerSecond',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'vertexRatePerSecond',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'vertexStart',
        type: 'uint64',
      },
      {
        internalType: 'uint24',
        name: 'increaseThresholdStart',
        type: 'uint24',
      },
      {
        internalType: 'uint24',
        name: 'decreaseThresholdEnd',
        type: 'uint24',
      },
      {
        internalType: 'uint16',
        name: 'adjustmentVelocity',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: 'decayPerAdjustment',
        type: 'uint16',
      },
      {
        internalType: 'uint80',
        name: 'vertexMultiplierMax',
        type: 'uint80',
      },
      {
        internalType: 'address',
        name: 'linkedToken',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'cTokenAddress',
        type: 'address',
      },
    ],
    name: 'setLinkedToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetsHeld',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debt',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'interestFee',
        type: 'uint256',
      },
    ],
    name: 'supplyRate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'r',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: 'result',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'baseRatePerYear',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vertexRatePerYear',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vertexStart',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'adjustmentVelocity',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'decayPerAdjustment',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'vertexMultiplierMax',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'vertexReset',
        type: 'bool',
      },
    ],
    name: 'updateDynamicIRM',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'assetsHeld',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debt',
        type: 'uint256',
      },
    ],
    name: 'utilizationRate',
    outputs: [
      {
        internalType: 'uint256',
        name: 'r',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vertexMultiplier',
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

export default CurvanceIRM;
