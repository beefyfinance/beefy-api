const SiloV2Lens = [
  {
    inputs: [
      { internalType: 'contract ISilo', name: '_silo', type: 'address' },
      { internalType: 'address', name: '_borrower', type: 'address' },
    ],
    name: 'collateralBalanceOfUnderlying',
    outputs: [{ internalType: 'uint256', name: 'borrowerCollateral', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISilo', name: '_silo', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '_borrower', type: 'address' },
    ],
    name: 'collateralBalanceOfUnderlying',
    outputs: [{ internalType: 'uint256', name: 'borrowerCollateral', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISilo', name: '_silo', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '_borrower', type: 'address' },
    ],
    name: 'debtBalanceOfUnderlying',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISilo', name: '_silo', type: 'address' },
      { internalType: 'address', name: '_borrower', type: 'address' },
    ],
    name: 'debtBalanceOfUnderlying',
    outputs: [{ internalType: 'uint256', name: 'borrowerDebt', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getBorrowAPR',
    outputs: [{ internalType: 'uint256', name: 'borrowAPR', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getDepositAPR',
    outputs: [{ internalType: 'uint256', name: 'depositAPR', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getFeesAndFeeReceivers',
    outputs: [
      { internalType: 'address', name: 'daoFeeReceiver', type: 'address' },
      { internalType: 'address', name: 'deployerFeeReceiver', type: 'address' },
      { internalType: 'uint256', name: 'daoFee', type: 'uint256' },
      { internalType: 'uint256', name: 'deployerFee', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getInterestRateModel',
    outputs: [{ internalType: 'address', name: 'irm', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getLt',
    outputs: [{ internalType: 'uint256', name: 'lt', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ISilo', name: '_silo', type: 'address' },
      { internalType: 'address', name: '_borrower', type: 'address' },
    ],
    name: 'getLtv',
    outputs: [{ internalType: 'uint256', name: 'ltv', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getMaxLtv',
    outputs: [{ internalType: 'uint256', name: 'maxLtv', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract ISilo', name: '_silo', type: 'address' }],
    name: 'getRawLiquidity',
    outputs: [{ internalType: 'uint256', name: 'liquidity', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
export default SiloV2Lens;
