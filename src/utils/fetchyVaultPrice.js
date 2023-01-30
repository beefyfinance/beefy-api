import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import IBalancerVault from '../abis/IBalancerVault.json';

import { FANTOM_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const yvWFTM = '0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0';
const WFTM = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';
const poolId = '0xc3bf643799237588b7a6b407b3fc028dd4e037d200000000000000000000022d';
const vault = '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce';
const one = new BigNumber('1e18');

const fetchyvWFTMPrice = async tokenPrices => {
  const price = await getyvWFTMPrice(tokenPrices, FANTOM_CHAIN_ID);
  return { yvWFTM: price };
};

const getyvWFTMPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const vaultContract = getContractWithProvider(IBalancerVault, vault, web3);

  const data = await vaultContract.methods.getPoolTokens(poolId).call();
  let reserveA = new BigNumber(0);
  let reserveB = new BigNumber(0);
  for (let i = 0; i < data.tokens.length; i++) {
    if (data.tokens[i] == WFTM) {
      reserveA = new BigNumber(data.balances[i]);
    } else if (data.tokens[i] == yvWFTM) {
      reserveB = new BigNumber(data.balances[i]);
    }
  }
  const price = one.times(reserveB).dividedBy(reserveA.plus(one)).dividedBy('1e14');

  console.log('yvWFTM:', price.toString());

  return price.toNumber().toFixed(2);
};

export { fetchyvWFTMPrice };
