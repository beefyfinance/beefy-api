import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import IBalancerVault from '../abis/IBalancerVault.json';

import { POLYGON_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const usdc = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
const jbrl = '0xf2f77FE7b8e66571E0fca7104c4d670BF1C8d722';
const poolId = '0x5a5e4fa45be4c9cb214cd4ec2f2eb7053f9b4f6d000100000000000000000a30';
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
    } else if (data.tokens[i] == usdc) {
      reserveB = new BigNumber(data.balances[i]);
    }
  }
  const price = one.times(reserveB).dividedBy(reserveA.plus(one)).dividedBy('1e6');

  console.log('jBRL:', price.toString());

  return price.toNumber().toFixed(2);
};

export { fetchJbrlPrice };
