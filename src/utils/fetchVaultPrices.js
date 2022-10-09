import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import IVault from '../abis/BeefyVaultV6.json';
import { getEDecimals } from './getEDecimals';

import { OPTIMISM_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';

const {
  optimism: {
    tokens: { ETH, rfaWETH, USDC, rfaUSDC, DAI, rfaDAI, WBTC, rfaWBTC, USDT, rfaUSDT },
  },
} = addressBook;

const tokens = {
  optimism: [
    [ETH, rfaWETH],
    [USDC, rfaUSDC],
    [DAI, rfaDAI],
    [WBTC, rfaWBTC],
    [USDT, rfaUSDT],
  ],
};

const getVaultPrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const balanceCalls = [];
  const totalSupplyCalls = [];
  const decimals = [];

  tokens.forEach(token => {
    const tokenContract = getContract(IVault, token[1].address);
    balanceCalls.push({
      balance: tokenContract.methods.balance(),
    });
    totalSupplyCalls.push({
      totalSupply: tokenContract.methods.totalSupply(),
    });
    let edecimal = getEDecimals(token[0].decimals);
    decimals.push(edecimal);
  });

  let res;
  try {
    res = await multicall.all([balanceCalls, totalSupplyCalls]);
  } catch (e) {
    console.error('getVaultPrices', e);
    return tokens.map(() => 0);
  }
  const balanceOfPool = res[0].map(v => new BigNumber(v.balance));
  const totalSupply = res[1].map(v => new BigNumber(v.totalSupply));

  return balanceOfPool.map((v, i) =>
    v
      .times('1e18')
      .times(tokenPrices[tokens[i][0].symbol])
      .dividedBy(totalSupply[i])
      .dividedBy(decimals[i])
      .toNumber()
  );
};

const fetchVaultPrices = async tokenPrices =>
  Promise.all([getVaultPrices(tokenPrices, tokens.optimism, OPTIMISM_CHAIN_ID)]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchVaultPrices };
