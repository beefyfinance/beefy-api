import { BlockApiResponse, ERC20TxApiResponse } from './EtherscanApiResponseTypes';

import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';
import { addressBook } from 'blockchain-addressbook';

import fetchPrice from '../../../utils/fetchPrice';
import { getUtcSecondsFromDayRange } from '../../../utils/getUtcSecondsFromDayRange';
import { getEDecimals } from '../../../utils/getEDecimals';
import { etherscanApiUrlMap } from './EtherscanApiUrlMap';
import { bifiLpMap } from './BifiLpMap';

const INIT_DELAY = 40 * 1000;
const REFRESH_INTERVAL = 15 * 60 * 1000;

type BifiBuybackByChainMap = { [chainName: string]: BigNumber };

const getOneDayBlocksFromEtherscan = async (scanUrl: string) => {
  const [start, end] = getUtcSecondsFromDayRange(0, 1);
  const startBlock = await getBlockFromEtherscan(scanUrl, start);
  const endBlock = await getBlockFromEtherscan(scanUrl, end);
  return [startBlock, endBlock];
};

const getBlockFromEtherscan = async (scanUrl: string, timestamp: number) => {
  const url = `${scanUrl}/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=YourApiKeyToken`;
  const resp = await fetch(url);
  const json: BlockApiResponse = await resp.json();
  return json.result;
};

const getBuyback = async (
  chainName: string,
  scanUrl: string,
  BIFI: any, // TODO type this with brknrobot's address book types, once merged
  bifiMaxiAddress: string,
  bifiLpAddress: string
): Promise<BifiBuybackByChainMap> => {
  let bifiBuybackTokenAmount = new BigNumber(0);
  const [startBlock, endBlock] = await getOneDayBlocksFromEtherscan(scanUrl);
  const url = `${scanUrl}/api?module=account&action=tokentx&address=${bifiMaxiAddress}&startblock=${startBlock}&endblock=${endBlock}&sort=asc&apikey=YourApiKeyToken`;
  const resp = await fetch(url);
  const json: ERC20TxApiResponse = await resp.json();
  let txCount = 0;
  for (const entry of json.result) {
    // actually should use the lp pool data here instead of address-book. Will change after converging address-book and api
    if (entry.from === bifiLpAddress.toLowerCase()) {
      const tokenAmount = new BigNumber(entry.value).dividedBy(getEDecimals(BIFI.decimals));
      bifiBuybackTokenAmount = bifiBuybackTokenAmount.plus(tokenAmount);
      txCount += 1;
    }
  }
  console.log(`Harvest count: ${txCount}`);
  return { [chainName]: bifiBuybackTokenAmount };
};

let dailyBifiBuybackInUsdByChain: BifiBuybackByChainMap = {};

const updateBifiBuyback = async () => {
  console.log('> updating bifi buyback');

  try {
    let promises = [];

    const chainNames = Object.keys(etherscanApiUrlMap);

    chainNames.forEach(chainName => {
      const scanUrl = etherscanApiUrlMap[chainName];
      const lp = bifiLpMap[chainName];
      const chainAddressBook = addressBook[chainName];
      const chainBIFI = chainAddressBook.tokens.BIFI;
      const chainBifiMaxi = chainAddressBook.platforms.beefyfinance.bifiMaxiStrategy;
      const prom = getBuyback(chainName, scanUrl, chainBIFI, chainBifiMaxi, lp);
      promises.push(prom);
    });

    const bifiPrice = await fetchPrice({ oracle: 'tokens', id: 'BIFI' });

    const results = await Promise.allSettled<BifiBuybackByChainMap[]>(promises);
    let dailyBifiBuybackAmountByChain: BifiBuybackByChainMap = {};
    for (const result of results) {
      if (result.status !== 'fulfilled') {
        console.warn('getBifiBuyback error', result.reason);
        continue;
      }

      dailyBifiBuybackAmountByChain = { ...dailyBifiBuybackAmountByChain, ...result.value };
    }

    for (const key in dailyBifiBuybackAmountByChain) {
      const tokenAmount = dailyBifiBuybackAmountByChain[key];
      const dailyBifiBuybackInUsd = tokenAmount.times(new BigNumber(bifiPrice));
      dailyBifiBuybackInUsdByChain = {
        ...dailyBifiBuybackInUsdByChain,
        [key]: dailyBifiBuybackInUsd,
      };
    }

    console.log('> updated bifi buyback');
  } catch (err) {
    console.error('> bifi buyback initialization failed', err);
  }

  setTimeout(updateBifiBuyback, REFRESH_INTERVAL);
};

setTimeout(updateBifiBuyback, INIT_DELAY);

export const getBifiBuyback = (): BifiBuybackByChainMap => {
  return dailyBifiBuybackInUsdByChain;
};
