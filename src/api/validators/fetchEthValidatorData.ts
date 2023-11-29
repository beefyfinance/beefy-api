import { formatGwei } from 'viem';
import { FetchValidatorPerformanceResponse } from './validators';

interface EthValidatorPerformanceData {
  status: string;
  data: {
    balance: number;
    performance1d: number;
    performance31d: number;
    performance365d: number;
    performance7d: number;
    performancetoday: number;
    performancetotal: number;
    rank7d: number;
    validatorindex: number;
  }[];
}
const ETH_VALIDATOR_PERFORMANCE_URL = 'https://beaconcha.in/api/v1/validator/402418/performance';

export const fetchEthValidatorTotalPerformance =
  async (): Promise<FetchValidatorPerformanceResponse> => {
    const data = await fetch(ETH_VALIDATOR_PERFORMANCE_URL);
    const ethValidatorData: EthValidatorPerformanceData =
      (await data.json()) as EthValidatorPerformanceData;
    return {
      totalPerformanceEther: formatGwei(BigInt(ethValidatorData.data[0].performancetotal)),
    };
  };
