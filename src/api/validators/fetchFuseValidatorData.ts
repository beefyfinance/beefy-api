import { FetchValidatorPerformanceResponse } from './validators';

interface CoinBalances {
  date: string;
  value: number;
}

const FUSE_VALIDATOR_COIN_BALANCES_URL =
  'https://explorer.fuse.io' +
  '/address' +
  '/0xEc4B821541f62b63832ceE400d6c29bCc84E4e38' +
  '/coin-balances' +
  '/by-day?type=JSON';

export const fetchFuseValidatorTotalPerformance =
  async (): Promise<FetchValidatorPerformanceResponse> => {
    const data = await fetch(FUSE_VALIDATOR_COIN_BALANCES_URL);
    const fuseValidatorData: CoinBalances[] = await data.json();
    const lastSum = fuseValidatorData[fuseValidatorData.length - 1].value;
    return {
      totalPerformanceEther: lastSum.toString(),
    };
  };
