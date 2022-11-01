import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import IWrappedAaveToken from '../abis/WrappedAaveToken.json';

import { ETH_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';

const RAY_DECIMALS = '1e27';

const {
  ethereum: {
    tokens: { aUSDT, waUSDT, aUSDC, waUSDC, aDAI, waDAI },
  },
} = addressBook;

const tokens = {
  ethereum: [
    [aUSDT, waUSDT],
    [aUSDC, waUSDC],
    [aDAI, waDAI],
  ],
};

const getWrappedAavePrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rateCalls = [];

  tokens.forEach(token => {
    const tokenContract = getContract(IWrappedAaveToken, token[1].address);
    rateCalls.push({
      rate: tokenContract.methods.rate(),
    });
  });

  let res;
  try {
    res = await multicall.all([rateCalls]);
  } catch (e) {
    console.error('getWrappedAavePrices', e);
    return tokens.map(() => 0);
  }
  const wrappedRates = res[0].map(v => new BigNumber(v.rate));

  return wrappedRates.map((v, i) =>
    v.times(tokenPrices[tokens[i][0].symbol]).dividedBy(RAY_DECIMALS).toNumber()
  );
};

const fetchWrappedAavePrices = async tokenPrices =>
  Promise.all([getWrappedAavePrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchWrappedAavePrices };
