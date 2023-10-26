import BigNumber from 'bignumber.js';
import { ETH_CHAIN_ID } from '../constants';
import IPot from '../abis/IPot';
import { fetchNoMulticallContract } from '../api/rpc/client';

const pot = '0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7';

const fetchDaiSavingsRate = async () => {
  let rate = new BigNumber(0);
  try {
    const potContract = fetchNoMulticallContract(pot, IPot, ETH_CHAIN_ID);

    rate = await potContract.read.dsr();
    rate = new BigNumber(rate)
      .dividedBy(1e27)
      .minus(1)
      .times(365)
      .times(86400)
      .times(100)
      .toNumber();

    // console.log(`DaiSavingsRate: ${rate}`);
  } catch (e) {
    console.error(`Error Fetching DaiSavingsRate price`);
  }

  return { savingsRate: rate };
};

export { fetchDaiSavingsRate };
