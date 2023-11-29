import { formatEther } from 'viem';
import { FetchValidatorPerformanceResponse } from './validators';

interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

interface InternalTxnApiResponse {
  status: string;
  message: string;
  result: Transaction[];
}

// goes until block 99999999 I guess?
const FTM_VALIDATOR_INTERNAL_TX_URL =
  'https://api.ftmscan.com/api?' +
  'module=account' +
  '&action=txlist' +
  '&address=0xe97a5292248c2647466222dc58563046b3e34b18' +
  '&startblock=0' +
  '&endblock=99999999' +
  '&sort=asc' +
  '&apikey=YourApiKeyToken';

export const fetchFtmValidatorTotalPerformance =
  async (): Promise<FetchValidatorPerformanceResponse> => {
    const correctMethodId = '0x7ff36ab5';
    const data = await fetch(FTM_VALIDATOR_INTERNAL_TX_URL);
    const ftmValidatorData: InternalTxnApiResponse = (await data.json()) as InternalTxnApiResponse;
    const totalValue = ftmValidatorData.result.reduce((accumulator, transaction) => {
      if (transaction.methodId === correctMethodId) {
        return accumulator + BigInt(transaction.value);
      }
      return accumulator;
    }, BigInt(0));

    return {
      totalPerformanceEther: formatEther(totalValue),
    };
  };
