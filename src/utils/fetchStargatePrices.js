const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { web3Factory, multicallAddress } = require('./web3');
const StargateLP = require('../abis/StargateLP.json');

import { FANTOM_CHAIN_ID, BSC_CHAIN_ID, AVAX_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';

const {
  bsc: {
    tokens: { USDT, sbUSDT, BUSD, sbBUSD },
  },
  fantom: {
    tokens: { USDC, sfUSDC },
  },
  avax: {
    tokens: { saUSDT, saUSDC },
  },
} = addressBook;

const tokens = {
  bsc: [
    [USDT, sbUSDT],
    [BUSD, sbBUSD],
  ],
  fantom: [[USDC, sfUSDC]],
  avax: [
    [USDT, saUSDT],
    [USDC, saUSDC],
  ],
};

const getStargatePrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const stakedInsPoolCalls = [];
  const totalsSupplyCalls = [];

  tokens.forEach(tokenPair => {
    const tokenContract = new web3.eth.Contract(StargateLP, tokenPair[1].address);
    stakedInsPoolCalls.push({
      stakedInsPool: tokenContract.methods.totalLiquidity(),
    });
    totalsSupplyCalls.push({
      totalsSupply: tokenContract.methods.totalSupply(),
    });
  });

  let res;
  try {
    res = await multicall.all([stakedInsPoolCalls, totalsSupplyCalls]);
  } catch (e) {
    console.error('getStargatePrices', e);
    return tokens.map(() => 0);
  }
  const stakedInsPool = res[0].map(v => new BigNumber(v.stakedInsPool));
  const totalsSupply = res[1].map(v => new BigNumber(v.totalsSupply));

  return stakedInsPool.map((v, i) =>
    v.times(tokenPrices[tokens[i][0].symbol]).dividedBy(totalsSupply[i]).toNumber()
  );
};

const fetchStargatePrices = async tokenPrices =>
  Promise.all([
    getStargatePrices(tokenPrices, tokens.fantom, FANTOM_CHAIN_ID),
    getStargatePrices(tokenPrices, tokens.bsc, BSC_CHAIN_ID),
    getStargatePrices(tokenPrices, tokens.avax, AVAX_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

module.exports = { fetchStargatePrices };
