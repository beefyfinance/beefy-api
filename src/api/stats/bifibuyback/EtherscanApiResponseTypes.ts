// ERC20 tx api response
interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface ERC20TxApiResponse {
  status: string;
  message: string;
  result: TokenTransfer[];
}

// block from timestamp response

export interface BlockApiResponse {
  status: string;
  message: string;
  result: string;
}
