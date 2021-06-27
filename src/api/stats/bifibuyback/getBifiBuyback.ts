import { BlockApiResponse, ERC20TxApiResponse } from './EtherscanApiResponseTypes';

import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { addressBook } from 'blockchain-addressbook';

import fetchPrice from '../../../utils/fetchPrice';
import { getUtcSecondsFromDayRange } from '../../../utils/getUtcSecondsFromDayRange';
import { getEDecimals } from '../../../utils/getEDecimals';

const {
  polygon: {
    tokens: { BIFI },
    platforms: { beefyfinance, quickswap },
  },
} = addressBook;

const INIT_DELAY = 40 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

const getOneDayBlocksFromPolygonscan = async () => {
  const [start, end] = getUtcSecondsFromDayRange(0, 1);
  const startBlock = await getBlockFromPolyscan(start);
  const endBlock = await getBlockFromPolyscan(end);
  return [startBlock, endBlock];
};

const getBlockFromPolyscan = async timestamp => {
  const url = `https://api.polygonscan.com/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=YourApiKeyToken`;
  const resp = await fetch(url);
  const json: BlockApiResponse = await resp.json();
  return json.result;
};

const getBuyback = async () => {
  let bifiBuybackTokenAmount = new BigNumber(0);
  const [startBlock, endBlock] = await getOneDayBlocksFromPolygonscan();
  const url = `https://api.polygonscan.com/api?module=account&action=tokentx&address=${beefyfinance.bifiMaxi}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=YourApiKeyToken`;
  const resp = await fetch(url);
  const json: ERC20TxApiResponse = await resp.json();
  let txCount = 0;
  for (const entry of json.result) {
    // actually should use the lp pool data here instead of address-book
    if (entry.from === quickswap.wethBifiLp) {
      // replace with token decimals
      const tokenAmount = new BigNumber(entry.value).dividedBy(getEDecimals(BIFI.decimals));
      bifiBuybackTokenAmount = bifiBuybackTokenAmount.plus(tokenAmount);
      txCount += 1;
    }
  }
  console.log(`Harvest count: ${txCount}`);
  return bifiBuybackTokenAmount;
};

let dailyBifiBuybackInUsd;

const updateBifiBuyback = async () => {
  console.log('> updating bifi buyback');

  try {
    const dailyBifiBuyback = await getBuyback();
    const bifiPrice = await fetchPrice({ oracle: 'tokens', id: BIFI.symbol });
    dailyBifiBuybackInUsd = dailyBifiBuyback.times(new BigNumber(bifiPrice));

    console.log('> updated bifi buyback');
  } catch (err) {
    console.error('> bifi buyback initialization failed', err);
  }

  setTimeout(updateBifiBuyback, REFRESH_INTERVAL);
};

setTimeout(updateBifiBuyback, INIT_DELAY);

export const getBifiBuyback = () => {
  return dailyBifiBuybackInUsd;
};
