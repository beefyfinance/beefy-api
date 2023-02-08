import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import IBalancerVault from '../abis/IBalancerVault.json';

import { POLYGON_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const brz = '0x491a4eB4f1FC3BfF8E1d2FC856a6A46663aD556f';
const jbrl = '0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722';
const poolId = '0xe22483774bd8611be2ad2f4194078dac9159f4ba0000000000000000000008f0';
const vault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const one = new BigNumber('1e18');

const fetchJbrlPrice = async tokenPrices => {
  const price = await getJbrlPrice(tokenPrices, POLYGON_CHAIN_ID);
  return { jBRL: price };
};

const getJbrlPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const vaultContract = getContractWithProvider(IBalancerVault, vault, web3);

  const data = await vaultContract.methods.getPoolTokens(poolId).call();
  let reserveA = new BigNumber(0);
  let reserveB = new BigNumber(0);
  for (let i = 0; i < data.tokens.length; i++) {
    if (data.tokens[i] == jbrl) {
      reserveA = new BigNumber(data.balances[i]);
    } else if (data.tokens[i] == brz) {
      reserveB = new BigNumber(data.balances[i]);
    }
  }

  let price = one
    .times(reserveB)
    .dividedBy(reserveA.plus(one))
    .times(tokenPrices['BRZ'])
    .dividedBy('1e4');

  return price.toNumber();
};

export { fetchJbrlPrice };
