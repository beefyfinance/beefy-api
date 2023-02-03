import BigNumber from 'bignumber.js';
import { web3Factory } from './web3';
import ICurvePool from '../abis/ICurvePool.json';
import IERC4626 from '../abis/IERC4626.json';

import { ETH_CHAIN_ID } from '../constants';
import { getContractWithProvider } from './contractHelper';

const pool = '0xa1f8a6807c402e4a15ef4eba36528a3fed24e577';
const sfrxETHContract = '0xac3E018457B222d93114458476f3E3416Abbe38F';

const fetchsfrxEthPrice = async tokenPrices => {
  const price = await getsfrxEthPrice(tokenPrices, ETH_CHAIN_ID);
  return { frxETH: price[0], sfrxETH: price[1] };
};

const getsfrxEthPrice = async (tokenPrices, chainId) => {
  const web3 = web3Factory(chainId);
  const poolContract = getContractWithProvider(ICurvePool, pool, web3);
  const tokenContract = getContractWithProvider(IERC4626, sfrxETHContract, web3);
  const amountOut = new BigNumber(
    await poolContract.methods.get_dy(0, 1, new BigNumber('1e18')).call()
  );
  const frxEthPrice = amountOut.times(tokenPrices['WETH']).dividedBy('1e18');

  const oneShareForAmount = new BigNumber(
    await tokenContract.methods.convertToAssets(new BigNumber('1e18')).call()
  );
  const sfrxEthPrice = frxEthPrice.times(oneShareForAmount).dividedBy('1e18');

  return [frxEthPrice.toNumber(), sfrxEthPrice.toNumber()];
};

export { fetchsfrxEthPrice };
