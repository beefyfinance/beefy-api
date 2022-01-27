const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('./web3');
const ERC20 = require('../abis/ERC20.json');
const fBEETSPool = require('../data/fantom/fBeetsPool.json');

import { addressBook } from '../../packages/address-book/address-book';
const {
  fantom: {
    tokens: { BOO, xBOO, SCREAM, xSCREAM, BEETS, fBEETS },
  },
} = addressBook;

const getXPrice = async (tokenPrice, tokenAddress, xTokenAddress) => {
  const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
  const xTokenContract = new web3.eth.Contract(ERC20, xTokenAddress);

  const stakedInXPool = new BigNumber(await tokenContract.methods.balanceOf(xTokenAddress).call());
  const totalXSupply = new BigNumber(await xTokenContract.methods.totalSupply().call());

  return stakedInXPool.times(tokenPrice).dividedBy(totalXSupply).toNumber();
};

const fetchXPrices = async tokenPrices => {
  return {
    xBOO: await getXPrice(tokenPrices.BOO, BOO.address, xBOO.address),
    xSCREAM: await getXPrice(tokenPrices.SCREAM, SCREAM.address, xSCREAM.address),
    fBEETS: await getXPrice(tokenPrices.BEETS, fBEETSPool[0].address, fBEETS.address),
  };
};

module.exports = { fetchXPrices };
