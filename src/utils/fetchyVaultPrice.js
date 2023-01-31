import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import IYearnTokenVault from '../abis/YearnTokenVault.json';

import { FANTOM_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const yvWFTM = '0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0';
const WFTM = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';

const getyVaultPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const vaultContract = getContractWithProvider(IYearnTokenVault, yvWFTM, web3);

  const pricePerShare = await vaultContract.methods.pricePerShare().call(); // TODO: use multicall
  const priceWFTM = new BigNumber(0.479); // TODO: grab real WFTM price from API
  const price = priceWFTM.times(pricePerShare).dividedBy('1e18');

  //debug
  console.log(pricePerShare);
  console.log('yvWFTM:', price.toString());

  return price.toNumber().toFixed(2);
};

const fetchyvWFTMPrice = async tokenPrices => {
  const price = await getyVaultPrice(tokenPrices, FANTOM_CHAIN_ID);
  return { yvWFTM: price };
};

export { fetchyvWFTMPrice };
