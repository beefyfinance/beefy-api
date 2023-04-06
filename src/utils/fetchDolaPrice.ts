import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import SOLID from '../abis/SolidPair.json';

import { OPTIMISM_CHAIN_ID as chainId } from '../constants';
import { getContractWithProvider } from './contractHelper';

const DOLA = '0x8aE125E8653821E851F12A49F7765db9a9ce7384';
const lpPair = '0x6C5019D345Ec05004A7E7B0623A91a0D9B8D590d';

const fetchDolaPrice = async tokenPrices => {
  const price = await getDolaPrice(tokenPrices, chainId);
  return { DOLA: price };
};

const getDolaPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const tokenContract = getContractWithProvider(SOLID, lpPair, web3);
  const amountOut = new BigNumber(
    await tokenContract.methods.current(DOLA, new BigNumber(1e18)).call()
  );
  const price = amountOut.times(tokenPrices['USDC']).dividedBy(1e6);

  return price.toNumber();
};

export { fetchDolaPrice };
