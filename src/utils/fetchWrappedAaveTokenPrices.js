import BigNumber from 'bignumber.js';
import {
  ARBITRUM_CHAIN_ID,
  AVAX_CHAIN_ID,
  ETH_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
} from '../constants';
import { addressBook } from '../../packages/address-book/address-book';
import { fetchContract } from '../api/rpc/client';
import WrappedAaveTokenAbi from '../abis/WrappedAaveToken';
import WrappedAave4626TokenAbi from '../abis/WrappedAave4626Token';

const RAY_DECIMALS = '1e27';

const {
  ethereum: {
    tokens: { aUSDT, waUSDT, aUSDC, waUSDC, aDAI, waDAI, aETH, waETH, DAI, sDAI },
  },
  polygon: {
    tokens: { amUSDT, wamUSDT, amUSDC, wamUSDC, amDAI, wamDAI, aWMATIC, waWMATIC, aWETH, waWETH },
  },
  optimism: {
    tokens: { 'USD+': USDplus, 'wUSD+': wUSDplus, 'DAI+': DAIplus, 'wDAI+': wDAIplus },
  },
  arbitrum: {
    tokens: { aWETH: aaWETH, waaWETH, aaUSDT, waaUSDT, aaUSDC, waaUSDC, aaDAI, waaDAI },
  },
  avax: {
    tokens: { aavAVAX, waavAVAX, aavUSDC, waavUSDC, aavUSDT, waavUSDT },
  },
} = addressBook;

const tokens = {
  ethereum: [
    [aUSDT, waUSDT],
    [aUSDC, waUSDC],
    [aDAI, waDAI],
    [aETH, waETH],
    [DAI, sDAI, true],
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
  arbitrum: [
    [aaWETH, waaWETH, true],
    [aaUSDT, waaUSDT, true],
    [aaUSDC, waaUSDC, true],
    [aaDAI, waaDAI, true],
  ],
  avax: [
    [aavAVAX, waavAVAX],
    [aavUSDC, waavUSDC],
    [aavUSDT, waavUSDT],
  ],
};

const getWrappedAavePrices = async (tokenPrices, tokens, chainId) => {
  const rateCalls = tokens.map(token => {
    if (!token[2]) {
      const contract = fetchContract(token[1].address, WrappedAaveTokenAbi, chainId);
      return contract.read.rate();
    } else {
      const contract = fetchContract(token[1].address, WrappedAave4626TokenAbi, chainId);
      return contract.read.convertToShares([1e18]);
    }
  });

  let res;
  try {
    res = await Promise.all(rateCalls);
  } catch (e) {
    console.error('getWrappedAavePrices', e.message);
    return tokens.map(() => 0);
  }
  const wrappedRates = res.map(v => new BigNumber(v.toString()));

  return wrappedRates.map((v, i) =>
    !tokens[i][2]
      ? v.times(tokenPrices[tokens[i][0].symbol]).dividedBy(RAY_DECIMALS).toNumber()
      : new BigNumber(tokenPrices[tokens[i][0].symbol]).times('1e18').dividedBy(v).toNumber()
  );
};

const fetchWrappedAavePrices = async tokenPrices =>
  Promise.all([
    getWrappedAavePrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.polygon, POLYGON_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.optimism, OPTIMISM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.arbitrum, ARBITRUM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.avax, AVAX_CHAIN_ID),
  ]).then(data =>
    data
      .flat()
      .reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].symbol] = cur), acc), {})
  );

export { fetchWrappedAavePrices };
