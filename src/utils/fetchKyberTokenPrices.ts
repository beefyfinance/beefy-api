import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import IKyberElasticPool from '../abis/IKyberElasticPool.json';

import { ETH_CHAIN_ID } from '../constants';
import { getContract } from './contractHelper';

const tokens = {
  ethereum: [
    {
      oracleId: 'KNC',
      decimals: '1e18',
      pool: '0xB5e643250FF59311071C5008f722488543DD7b3C',
      secondToken: 'ETH',
      secondTokenDecimals: '1e18',
    },
  ],
};

const getKyberPrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const kyberPriceCalls = [];

  tokens.forEach(async token => {
    const tokenContract = getContract(IKyberElasticPool, token.pool);
    kyberPriceCalls.push({
      price: tokenContract.methods.getPoolState(),
    });
  });

  let res;
  try {
    res = await multicall.all([kyberPriceCalls]);
  } catch (e) {
    console.error('getCurveTokenPrices', e);
    return tokens.map(() => 0);
  }

  const tokenPrice = res[0].map(v => v.price[1]);
  return tokenPrice.map((v, i) => tokenPrices[tokens[i].secondToken] / Math.pow(1.0001, v));
};

const fetchKyberTokenPrices = async tokenPrices =>
  Promise.all([getKyberPrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i].oracleId] = cur), acc), {})
  );

export { fetchKyberTokenPrices };
