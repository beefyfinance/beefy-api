import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import IPriceFeed from '../abis/IJarvisPriceFeed.json';
import { POLYGON_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const priceFeed: string = '0x12F513D977B47D1d155bC5ED4d295c1B10D6D027';
const priceId: string = '0x42524c5553440000000000000000000000000000000000000000000000000000';

const fetchJbrlPrice = async (): Promise<object> => {
  const web3 = web3Factory(POLYGON_CHAIN_ID);

  let price: BigNumber = new BigNumber(0);
  try {
    const priceFeedContract = getContractWithProvider(IPriceFeed, priceFeed, web3);
    price = new BigNumber(await priceFeedContract.methods.getLatestPrice(priceId).call()).dividedBy(
      '1e18'
    );
  } catch (e) {
    console.error(`Error Fetching jBRL price`);
  }

  return { jBRL: price.toNumber() };
};

export { fetchJbrlPrice };
