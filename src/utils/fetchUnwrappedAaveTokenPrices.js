import BigNumber from 'bignumber.js';
import { SONIC_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/src/address-book';
import { fetchContract } from '../api/rpc/client';
import WrappedAave4626TokenAbi from '../abis/WrappedAave4626Token';
import { getEDecimals } from './getEDecimals';

const {
  sonic: {
    tokens: { xSHADOW, x33 },
  },
} = addressBook;

const tokens = {
  sonic: [[xSHADOW, x33]],
};

/// Fetch price of the asset from the price of the wrapped token
const getUnwrappedAavePrices = async (tokenPrices, tokens, chainId) => {
  const rateCalls = tokens.map(token => {
    const contract = fetchContract(token[1].address, WrappedAave4626TokenAbi, chainId);
    return contract.read.convertToAssets([Number(getEDecimals(token[1].decimals))]);
  });

  let res;
  try {
    res = await Promise.all(rateCalls);
  } catch (e) {
    console.error('getUnwrappedAavePrices', e.message);
    return tokens.map(() => 0);
  }
  const unwrappedRates = res.map(v => new BigNumber(v.toString()));

  const mergedPrices = { ...tokenPrices };
  const results = [];

  for (let i = 0; i < unwrappedRates.length; i++) {
    const v = unwrappedRates[i];
    const tokenGroup = tokens[i];

    let price;
    price = new BigNumber(mergedPrices[tokenGroup[1].oracleId])
      .times(getEDecimals(tokenGroup[0].decimals))
      .dividedBy(v)
      .toNumber();

    results.push(price);
    mergedPrices[tokenGroup[0].oracleId] = price;
  }

  return results;
};

const fetchUnwrappedAavePrices = async tokenPrices =>
  Promise.all([getUnwrappedAavePrices(tokenPrices, tokens.sonic, SONIC_CHAIN_ID)]).then(data =>
    data.flat().reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][0].oracleId] = cur), acc), {})
  );

export { fetchUnwrappedAavePrices };
