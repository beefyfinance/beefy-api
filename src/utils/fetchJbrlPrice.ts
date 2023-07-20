import BigNumber from 'bignumber.js';
import { POLYGON_CHAIN_ID } from '../constants';
import IJarvisPriceFeed from '../abis/IJarvisPriceFeed';
import { fetchNoMulticallContract } from '../api/rpc/client';

const priceFeed: string = '0x12F513D977B47D1d155bC5ED4d295c1B10D6D027';
const priceId: `0x${string}` = '0x42524c5553440000000000000000000000000000000000000000000000000000';

const fetchJbrlPrice = async (): Promise<object> => {
  let price: BigNumber = new BigNumber(0);
  try {
    const priceFeedContract = fetchNoMulticallContract(
      priceFeed,
      IJarvisPriceFeed,
      POLYGON_CHAIN_ID
    );
    price = new BigNumber(
      (await priceFeedContract.read.getLatestPrice([priceId])).toString()
    ).dividedBy('1e18');
  } catch (e) {
    console.error(`Error Fetching jBRL price`);
  }

  return { jBRL: price.toNumber() };
};

export { fetchJbrlPrice };
