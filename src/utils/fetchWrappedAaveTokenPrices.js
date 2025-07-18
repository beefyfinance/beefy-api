import BigNumber from 'bignumber.js';
import {
  ARBITRUM_CHAIN_ID,
  AVAX_CHAIN_ID,
  ETH_CHAIN_ID,
  GNOSIS_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
  BASE_CHAIN_ID,
} from '../constants';
import { addressBook } from '../../packages/address-book/src/address-book';
import { fetchContract } from '../api/rpc/client';
import WrappedAaveTokenAbi from '../abis/WrappedAaveToken';
import WrappedAave4626TokenAbi from '../abis/WrappedAave4626Token';
import OrbETHAbi from '../abis/OrbETH';
import rswETHAbi from '../abis/rswETH';
import { getEDecimals } from './getEDecimals';

const RAY_DECIMALS = '1e27';

const {
  ethereum: {
    tokens: {
      aUSDT,
      waUSDT,
      aUSDC,
      waUSDC,
      aDAI,
      waDAI,
      aETH,
      waETH,
      DAI,
      sDAI,
      rsETH,
      rswETH,
      DOLA,
      sDOLA,
      USDC: ethUSDC,
      csUSDC,
      USDL,
      wUSDL,
      csUSDL,
      waEthUSDT,
      waEthUSDC,
      waEthLidoGHO,
      GHO: ethGHO,
      USDe,
      waEthUSDe,
      wstETH,
      waEthLidowstETH,
      WETH,
      waEthLidoWETH,
      fwstETH,
      fWETH,
    },
  },
  polygon: {
    tokens: { amUSDT, wamUSDT, amUSDC, wamUSDC, amDAI, wamDAI, aWMATIC, waWMATIC, aWETH, waWETH },
  },
  optimism: {
    tokens: {
      'USD+': USDplus,
      'wUSD+': wUSDplus,
      'DAI+': DAIplus,
      'wDAI+': wDAIplus,
      WETH: optWETH,
      waOptWETH,
      wstETH: optwstETH,
      rETH: optrETH,
      waOptrETH,
      waOptwstETH,
      waOptUSDCn,
      USDC: optUSDC,
    },
  },
  arbitrum: {
    tokens: {
      aWETH: aaWETH,
      waaWETH,
      aaUSDT,
      waaUSDT,
      aaUSDC,
      waaUSDC,
      aaDAI,
      waaDAI,
      'USD+': arbUSDplus,
      'arbwUSD+': arbwUSDplus,
      gDAI,
      stataArbUSDCn,
      stataArbUSDTn,
      USDC,
      gUSDC,
      FRAX,
      stataArbFRAXn,
      GHO,
      stataArbGHOn,
      waArbGHO,
      WETH: arbWETH,
      waArbWETH,
      waArbUSDCn,
      USDT: arbUSDT,
      waArbUSDT,
      WBTC: arbWBTC,
      waArbWBTC,
      wstETH: arbwstETH,
      waArbwstETH,
      ezETH: arbezETH,
      waArbezETH,
      orbETH,
    },
  },
  avax: {
    tokens: {
      aavAVAX,
      waavAVAX,
      aavUSDC,
      waavUSDC,
      aavUSDT,
      waavUSDT,
      WAVAX,
      waAvaWAVAX,
      waAvaWETH,
      WETHe: avaWETH,
      BTCb,
      waAvaBTCb,
      waAvaUSDC,
      USDC: avaUSDC,
      sAVAX,
      waAvaSAVAX,
    },
  },
  gnosis: {
    tokens: { stEUR, EURA, agETH, wagETH, agwstETH, wagwstETH, agGNO, wagGNO },
  },
  base: {
    tokens: {
      GHO: baseGHO,
      waBasGHO,
      USDC: baseUSDC,
      waBasUSDC,
      wstETH: basewstETH,
      waBaswstETH,
      ezETH: baseezETH,
      waBasezETH,
      WETH: baseWETH,
      waBasWETH,
      smUSDC,
    },
  },
} = addressBook;

const tokens = {
  ethereum: [
    [aUSDT, waUSDT],
    [aUSDC, waUSDC],
    [aDAI, waDAI],
    [aETH, waETH],
    [DAI, sDAI, true],
    [rsETH, rswETH, true, true],
    [DOLA, sDOLA, true],
    [ethUSDC, csUSDC, true],
    [USDL, wUSDL, true],
    [wUSDL, csUSDL, true],
    [aUSDT, waEthUSDT, true],
    [ethUSDC, waEthUSDC, true],
    [ethGHO, waEthLidoGHO, true],
    [USDe, waEthUSDe, true],
    [wstETH, waEthLidowstETH, true],
    [WETH, waEthLidoWETH, true],
    [WETH, fWETH, true],
    [wstETH, fwstETH, true],
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
        oracleId: 'oUSD+',
      },
      wUSDplus,
    ],
    [DAIplus, wDAIplus],
    [optWETH, waOptWETH, true],
    [optwstETH, waOptwstETH, true],
    [optrETH, waOptrETH, true],
    [optUSDC, waOptUSDCn, true],
  ],
  arbitrum: [
    [aaWETH, waaWETH, true],
    [aaUSDT, waaUSDT, true],
    [aaUSDC, waaUSDC, true],
    [aaDAI, waaDAI, true],
    [arbUSDplus, arbwUSDplus],
    [DAI, gDAI, true, false],
    [aaUSDC, stataArbUSDCn],
    [aaUSDT, stataArbUSDTn],
    [USDC, gUSDC, true, false],
    [FRAX, stataArbFRAXn],
    [GHO, stataArbGHOn],
    [GHO, waArbGHO, true],
    [arbWETH, waArbWETH, true],
    [USDC, waArbUSDCn, true],
    [arbUSDT, waArbUSDT, true],
    [arbWBTC, waArbWBTC, true],
    [arbwstETH, waArbwstETH, true],
    [arbezETH, waArbezETH, true],
    [arbWETH, orbETH, true],
  ],
  avax: [
    [aavAVAX, waavAVAX],
    [aavUSDC, waavUSDC],
    [aavUSDT, waavUSDT],
    [WAVAX, waAvaWAVAX, true],
    [avaWETH, waAvaWETH, true],
    [BTCb, waAvaBTCb, true],
    [avaUSDC, waAvaUSDC, true],
    [sAVAX, waAvaSAVAX, true],
  ],
  gnosis: [
    [EURA, stEUR, true],
    [agETH, wagETH, true],
    [agwstETH, wagwstETH, true],
    [agGNO, wagGNO, true],
  ],
  base: [
    [baseGHO, waBasGHO, true],
    [baseUSDC, waBasUSDC, true],
    [basewstETH, waBaswstETH, true],
    [baseezETH, waBasezETH, true],
    [baseWETH, waBasWETH, true],
    [baseUSDC, smUSDC, true],
  ],
};

const getWrappedAavePrices = async (tokenPrices, tokens, chainId) => {
  const rateCalls = tokens.map(token => {
    if (!token[2]) {
      const contract = fetchContract(token[1].address, WrappedAaveTokenAbi, chainId);
      return contract.read.rate();
    } else if (token[3]) {
      const contract = fetchContract(token[1].address, rswETHAbi, chainId);
      return contract.read.getRate();
    } else {
      if (token[1].oracleId === 'orbETH') {
        const contract = fetchContract(token[1].address, OrbETHAbi, chainId);
        return contract.read.tokensPerLST();
      }
      const contract = fetchContract(token[1].address, WrappedAave4626TokenAbi, chainId);
      return contract.read.convertToShares([Number(getEDecimals(token[0].decimals))]);
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

  const mergedPrices = { ...tokenPrices };
  const results = [];

  for (let i = 0; i < wrappedRates.length; i++) {
    const v = wrappedRates[i];
    const tokenGroup = tokens[i];

    let price;
    if (!tokenGroup[2]) {
      price = v.times(mergedPrices[tokenGroup[0].oracleId]).dividedBy(RAY_DECIMALS).toNumber();
    } else if (tokenGroup[0].oracleId === 'rsETH') {
      price = v.times(mergedPrices[tokenGroup[0].oracleId]).dividedBy('1e18').toNumber();
    } else {
      price = new BigNumber(mergedPrices[tokenGroup[0].oracleId])
        .times(getEDecimals(tokenGroup[1].decimals))
        .dividedBy(v)
        .toNumber();
    }

    results.push(price);
    mergedPrices[tokenGroup[1].oracleId] = price;
  }

  return results;
};

const fetchWrappedAavePrices = async tokenPrices =>
  Promise.all([
    getWrappedAavePrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.polygon, POLYGON_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.optimism, OPTIMISM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.arbitrum, ARBITRUM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.avax, AVAX_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.gnosis, GNOSIS_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.base, BASE_CHAIN_ID),
  ]).then(data =>
    data.flat().reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].oracleId] = cur), acc), {})
  );

export { fetchWrappedAavePrices };
