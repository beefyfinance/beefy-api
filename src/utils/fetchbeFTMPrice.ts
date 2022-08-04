import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import SOLID from '../abis/SolidPair.json';

import { FANTOM_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const beFTM = '0x7381eD41F6dE418DdE5e84B55590422a57917886';
const lpPair = '0x387a11D161f6855Bd3c801bA6C79Fe9b824Ce1f3';

const fetchbeFTMPrice = async tokenPrices => {
  const price = await getbeFTMPrice(tokenPrices, FANTOM_CHAIN_ID);
  return { beFTM: price };
};

const getbeFTMPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const tokenContract = getContractWithProvider(SOLID, lpPair, web3);
  const amountOut = new BigNumber(
    await tokenContract.methods.current(beFTM, new BigNumber(1000000000000000000)).call()
  );
  const price = amountOut.times(tokenPrices['WFTM']).dividedBy(1000000000000000000);

  return price.toNumber();
};

export { fetchbeFTMPrice };
