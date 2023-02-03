import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import IYearnTokenVault from '../abis/YearnTokenVault.json';

import { FANTOM_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';

const {
  fantom: {
    tokens: { WFTM, yvWFTM },
  },
} = addressBook;

const tokens = {
  fantom: [[WFTM, yvWFTM]],
};

const getyVaultPrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const pricePerShareCalls = [];

  tokens.forEach(token => {
    const yVaultContract = getContract(IYearnTokenVault, token[1].address);
    pricePerShareCalls.push({
      pricePerShare: yVaultContract.methods.pricePerShare(),
    });
  });

  let res;
  try {
    res = await multicall.all([pricePerShareCalls]);
  } catch (e) {
    console.error('getyVaultPrices', e);
    return tokens.map(() => 0);
  }

  const pricePerShare = res[0].map(v => new BigNumber(v.pricePerShare));
  return pricePerShare.map((v, i) =>
    v.times(tokenPrices[tokens[i][0].symbol]).dividedBy('1e18').toNumber()
  );
};

const fetchyVaultPrices = async tokenPrices =>
  Promise.all([getyVaultPrices(tokenPrices, tokens.fantom, FANTOM_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchyVaultPrices };
