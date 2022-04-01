const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { web3Factory, multicallAddress } = require('./web3');
const ERC20 = require('../abis/ERC20.json');

import { FANTOM_CHAIN_ID, FUSE_CHAIN_ID, POLYGON_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';

const {
  fantom: {
    tokens: { BOO, xBOO, SCREAM, xSCREAM, CREDIT, xCREDIT },
  },
  polygon: {
    tokens: { QUICK, dQUICK },
  },
  fuse: {
    tokens: { VOLT, xVOLT },
  },
} = addressBook;

const tokens = {
  fantom: [
    [BOO, xBOO],
    [SCREAM, xSCREAM],
    [CREDIT, xCREDIT],
  ],
  polygon: [[QUICK, dQUICK]],
  fuse: [[VOLT, xVOLT]],
};

const getXPrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const stakedInXPoolCalls = [];
  const totalXSupplyCalls = [];

  tokens.forEach(token => {
    const tokenContract = new web3.eth.Contract(ERC20, token[0].address);
    const xTokenContract = new web3.eth.Contract(ERC20, token[1].address);
    stakedInXPoolCalls.push({
      stakedInXPool: tokenContract.methods.balanceOf(token[1].address),
    });
    totalXSupplyCalls.push({
      totalXSupply: xTokenContract.methods.totalSupply(),
    });
  });

  let res;
  try {
    res = await multicall.all([stakedInXPoolCalls, totalXSupplyCalls]);
  } catch (e) {
    console.error('getXPrices', e);
    return tokens.map(() => 0);
  }
  const stakedInXPool = res[0].map(v => new BigNumber(v.stakedInXPool));
  const totalXSupply = res[1].map(v => new BigNumber(v.totalXSupply));

  return stakedInXPool.map((v, i) =>
    v.times(tokenPrices[tokens[i][0].symbol]).dividedBy(totalXSupply[i]).toNumber()
  );
};

const fetchXPrices = async tokenPrices =>
  Promise.all([
    getXPrices(tokenPrices, tokens.fantom, FANTOM_CHAIN_ID),
    getXPrices(tokenPrices, tokens.polygon, POLYGON_CHAIN_ID),
    getXPrices(tokenPrices, tokens.fuse, FUSE_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

module.exports = { fetchXPrices };
