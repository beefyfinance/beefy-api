import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import ICurvePool from '../abis/ICurvePool.json';

import { MOONBEAM_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const pool = '0xc6e37086D09ec2048F151D11CdB9F9BbbdB7d685';

const fetchstDOTPrice = async tokenPrices => {
  const price = await getstDOTPrice(tokenPrices, MOONBEAM_CHAIN_ID);
  return { stDOT: price };
};

const getstDOTPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const tokenContract = getContractWithProvider(ICurvePool, pool, web3);
  const amountOut = new BigNumber(
    await tokenContract.methods.get_dy(0, 1, new BigNumber('1e10')).call()
  );
  const price = amountOut.times(tokenPrices['xcDOT']).dividedBy('1e10');

  return price.toNumber();
};

export { fetchstDOTPrice };
