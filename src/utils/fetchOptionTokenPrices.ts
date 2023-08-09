import BigNumber from 'bignumber.js';
import { FANTOM_CHAIN_ID, BASE_CHAIN_ID, CANTO_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import OptionsToken from '../abis/OptionsToken';
import { fetchContract } from '../api/rpc/client';
import Token from '../../packages/address-book/types/token';

const {
  fantom: {
    tokens: { FVM, oFVM },
  },
  base: {
    tokens: { BVM, oBVM },
  },
  canto: {
    tokens: { CVM, oCVM },
  },
} = addressBook;

const tokens = {
  fantom: [[FVM, oFVM]],
  base: [[BVM, oBVM]],
  canto: [[CVM, oCVM]],
};

let hundred = new BigNumber(100);

const getOptionTokenPrices = async (tokenPrices, tokens: Token[][], chainId) => {
  const discountCalls = tokens.map(token => {
    const contract = fetchContract(token[1].address, OptionsToken, chainId);
    return contract.read.discount();
  });

  try {
    const [discountCallResults] = await Promise.all([Promise.all(discountCalls)]);

    const discount = discountCallResults.map(v => new BigNumber(v.toString()));

    return discount.map((v, i) =>
      new BigNumber(tokenPrices[tokens[i][0].symbol])
        .times(hundred.minus(v))
        .dividedBy(hundred)
        .toNumber()
    );
  } catch (e) {
    console.error('getOptionTokenPrices', e);
    return tokens.map(() => 0);
  }
};

export async function fetchOptionTokenPrices(
  tokenPrices: Record<string, number>
): Promise<Record<string, number>> {
  return Promise.all([
    getOptionTokenPrices(tokenPrices, tokens.fantom, FANTOM_CHAIN_ID),
    getOptionTokenPrices(tokenPrices, tokens.base, BASE_CHAIN_ID),
    getOptionTokenPrices(tokenPrices, tokens.canto, CANTO_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );
}
