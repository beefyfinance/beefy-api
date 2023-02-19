import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import IEToken from '../abis/ethereum/IEToken.json';

import { ETH_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';
import { getEDecimals } from './getEDecimals';

const {
  ethereum: {
    tokens: { eUSDT, eDAI, eUSDC, USDT, USDC, DAI },
  },
} = addressBook;

const tokens = {
  ethereum: [
    [USDT, eUSDT],
    [USDC, eUSDC],
    [DAI, eDAI],
  ],
};

const getEulerTokenPrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rateCalls = [];

  tokens.forEach(async token => {
    const tokenContract = getContract(IEToken, token[1].address);
    rateCalls.push({
      rate: tokenContract.methods.convertBalanceToUnderlying(new BigNumber('1e18')),
    });
  });

  let res;
  try {
    res = await multicall.all([rateCalls]);
  } catch (e) {
    console.error('getEulerTokenPrices', e);
    return tokens.map(() => 0);
  }
  const rates = res[0].map(v => new BigNumber(v.rate));

  return rates.map((v, i) =>
    v
      .times(tokenPrices[tokens[i][0].symbol])
      .dividedBy(new BigNumber(getEDecimals(tokens[i][0].decimals)))
      .toNumber()
  );
};

const fetchEulerTokenPrices = async tokenPrices =>
  Promise.all([getEulerTokenPrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchEulerTokenPrices };
