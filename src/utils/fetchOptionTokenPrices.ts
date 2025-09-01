import BigNumber from 'bignumber.js';
import { LINEA_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/src/address-book';
import OptionsToken from '../abis/OptionsToken';
import { fetchContract } from '../api/rpc/client';
import Token from '../../packages/address-book/src/types/token';

const {
  linea: {
    tokens: { LYNX, oLYNX },
  },
} = addressBook;

const tokens = {
  linea: [[LYNX, oLYNX]],
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
      new BigNumber(tokenPrices[tokens[i][0].oracleId]).times(hundred.minus(v)).dividedBy(hundred).toNumber()
    );
  } catch (e) {
    console.error('getOptionTokenPrices', e);
    return tokens.map(() => 0);
  }
};

export async function fetchOptionTokenPrices(
  tokenPrices: Record<string, number>
): Promise<Record<string, number>> {
  return Promise.all([getOptionTokenPrices(tokenPrices, tokens.linea, LINEA_CHAIN_ID)]).then(data =>
    data.flat().reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].oracleId] = cur), acc), {})
  );
}
