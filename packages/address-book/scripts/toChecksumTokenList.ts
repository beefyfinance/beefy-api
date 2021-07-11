import { toChecksumAddress } from 'ethereumjs-util';
import { TokenList } from '../util/tokenList';
import fetch from 'node-fetch';
import type Token from '../types/token';

import transformTokenListToObject from '../util/transfomTokenListToObject';
import chainIdMap from '../util/chainIdMap';

const tokenLists = {
  bsc: ['https://gateway.pinata.cloud/ipfs/QmdKy1K5TMzSHncLzUXUJdvKi1tHRmJocDRfmCXxW5mshS'],
  quickswap: [
    'https://unpkg.com/quickswap-default-token-list@1.0.59/build/quickswap-default.tokenlist.json',
  ],
  avax: [
    'https://raw.githubusercontent.com/pangolindex/tokenlists/main/aeb.tokenlist.json',
    'https://raw.githubusercontent.com/pangolindex/tokenlists/main/defi.tokenlist.json',
    'https://raw.githubusercontent.com/pangolindex/tokenlists/main/stablecoin.tokenlist.json',
  ],
};

const toChecksumTokenList = (tokens: Token[]): void => {
  for (const token of tokens) {
    token.address = toChecksumAddress(token.address);
  }
};

(async () => {
  const chainId = chainIdMap.bsc;
  let tokens: Token[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tokenListFinal: any;
  for (const tokenList of tokenLists.bsc) {
    const response = await fetch(tokenList);
    const tokenListTmp = (await response.json()) as unknown as TokenList;
    tokenListFinal = tokenListTmp;
    tokens = [...tokens, ...tokenListTmp.tokens];
  }
  toChecksumTokenList(tokens);
  tokenListFinal.tokens = tokens;
  const toMap = transformTokenListToObject(tokenListFinal, chainId);
  console.log(JSON.stringify(toMap));
})();
