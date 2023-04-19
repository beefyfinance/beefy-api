import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import IPriceFeed from '../abis/IJarvisPriceFeed.json';
import { POLYGON_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const priceFeed = '0x12F513D977B47D1d155bC5ED4d295c1B10D6D027';
const priceId = '0x42524c5553440000000000000000000000000000000000000000000000000000';

const fetchJbrlPrice = async () => {
  const web3 = web3Factory(POLYGON_CHAIN_ID);

  const priceFeedContract = getContractWithProvider(IPriceFeed, priceFeed, web3);
  const price = new BigNumber(await priceFeedContract.methods.getLatestPrice(priceId).call()).dividedBy('1e18'),

  return {jBRL: price.toNumber()};
};

export { fetchJbrlPrice };
