import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { web3Factory, multicallAddress } from './web3';
import IWrappedAaveToken from '../abis/WrappedAaveToken.json';
import IWrappedAave4626Token from '../abis/WrappedAave4626Token.json';

import { ARBITRUM_CHAIN_ID, ETH_CHAIN_ID, OPTIMISM_CHAIN_ID, POLYGON_CHAIN_ID } from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { getContract } from './contractHelper';

const RAY_DECIMALS = '1e27';

const {
  ethereum: {
    tokens: { aUSDT, waUSDT, aUSDC, waUSDC, aDAI, waDAI },
  },
  polygon: {
    tokens: { amUSDT, wamUSDT, amUSDC, wamUSDC, amDAI, wamDAI, aWMATIC, waWMATIC, aWETH, waWETH },
  },
  optimism: {
    tokens: { 'USD+': USDplus, 'wUSD+': wUSDplus, 'DAI+': DAIplus, 'wDAI+': wDAIplus },
  },
  arbitrum: {
    tokens: { aWETH: aaWETH, waaWETH },
  },
} = addressBook;

const tokens = {
  ethereum: [
    [aUSDT, waUSDT],
    [aUSDC, waUSDC],
    [aDAI, waDAI],
  ],
  polygon: [
    [amUSDT, wamUSDT],
    [amUSDC, wamUSDC],
    [amDAI, wamDAI],
    [aWMATIC, waWMATIC, true],
    [aWETH, waWETH, true],
  ],
  optimism: [
    [
      {
        symbol: 'oUSD+',
      },
      wUSDplus,
    ],
    [DAIplus, wDAIplus],
  ],
  arbitrum: [[aaWETH, waaWETH, true]],
};

const getWrappedAavePrices = async (tokenPrices, tokens, chainId) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rateCalls = [];

  tokens.forEach(token => {
    let tokenContract;
    if (!token[2]) {
      tokenContract = getContract(IWrappedAaveToken, token[1].address);
    } else tokenContract = getContract(IWrappedAave4626Token, token[1].address);
    rateCalls.push({
      rate: !token[2]
        ? tokenContract.methods.rate()
        : tokenContract.methods.convertToAssets(new BigNumber(1e18)),
    });
  });

  let res;
  try {
    res = await multicall.all([rateCalls]);
  } catch (e) {
    console.error('getWrappedAavePrices', e);
    return tokens.map(() => 0);
  }
  const wrappedRates = res[0].map(v => new BigNumber(v.rate));

  return wrappedRates.map((v, i) =>
    v
      .times(tokenPrices[tokens[i][0].symbol])
      .dividedBy(tokens[i][2] ? '1e18' : RAY_DECIMALS)
      .toNumber()
  );
};

const fetchWrappedAavePrices = async tokenPrices =>
  Promise.all([
    getWrappedAavePrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.polygon, POLYGON_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.optimism, OPTIMISM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.arbitrum, ARBITRUM_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchWrappedAavePrices };
