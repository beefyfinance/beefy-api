import { BigNumber } from 'bignumber.js';
import {
  ARBITRUM_CHAIN_ID,
  AVAX_CHAIN_ID,
  ETH_CHAIN_ID,
  GNOSIS_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
  BASE_CHAIN_ID,
  MONAD_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../constants.ts';
import { addressBook } from '../../packages/address-book/src/address-book/index.ts';
import { fetchContract } from '../api/rpc/client.ts';
import WrappedAaveTokenAbi from '../abis/WrappedAaveToken.ts';
import WrappedAave4626TokenAbi from '../abis/WrappedAave4626Token.ts';
import OrbETHAbi from '../abis/OrbETH.ts';
import rswETHAbi from '../abis/rswETH.ts';
import { getEDecimals } from './getEDecimals.ts';
import { getLoggerFor } from './logger/index.ts';

const logger = getLoggerFor({ module: 'prices', platform: 'aave' });

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
      waEthWETH,
    },
  },
  polygon: {
    tokens: { amUSDT, wamUSDT, amUSDC, wamUSDC, amDAI, wamDAI, aWMATIC, waWMATIC, aWETH, waWETH },
  },
  optimism: {
    tokens: {
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
      aBasUSDC,
    },
  },
  monad: {
    tokens: {
      WMON,
      cWMON,
      AZND,
      loAZND,
      wnAUSD,
      wnUSDC,
      wnWMON,
      wngMON,
      wnshMON,
      wnsMON,
      wnloAZND,
      USDT0,
      wnUSDT0,
      USDC: mUSDC,
      AUSD,
      gMON,
      shMON,
      sMON,
    },
  },
  sonic: {
    tokens: { wawS, S },
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
    [WETH, waEthWETH, true],
  ],
  polygon: [
    [amUSDT, wamUSDT],
    [amUSDC, wamUSDC],
    [amDAI, wamDAI],
    [aWMATIC, waWMATIC, true],
    [aWETH, waWETH, true],
  ],
  optimism: [
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
  monad: [
    [WMON, cWMON, true],
    [AZND, loAZND, true],
    [USDT0, wnUSDT0, true],
    [AUSD, wnAUSD, true],
    [mUSDC, wnUSDC, true],
    [WMON, wnWMON, true],
    [gMON, wngMON, true],
    [shMON, wnshMON, true],
    [sMON, wnsMON, true],
    [loAZND, wnloAZND, true],
  ],
  sonic: [[S, wawS, true]],
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
    logger.error({ chain: chainId, err: e }, 'failed to read all rates');
    return tokens.map(() => 0);
  }
  const wrappedRates = res.map(v => new BigNumber(v.toString()));

  const mergedPrices = { ...tokenPrices };
  const results = [];

  for (let i = 0; i < wrappedRates.length; i++) {
    const wrappedRate = wrappedRates[i];
    const tokenGroup = tokens[i];

    if (!tokenGroup) {
      logger.warn({ chain: chainId, index: i }, 'missing token group');
      results.push(0);
      continue;
    }

    const [unwrapped, wrapped, inverseRate] = tokenGroup;
    const setPrice = (price) => {
      results.push(price);
      mergedPrices[wrapped.oracleId] = price;
    }

    let token0Price = mergedPrices[unwrapped.oracleId];
    if (!token0Price) {
      logger.warn({ chain: chainId, unwrapped: unwrapped.oracleId, wrapped: wrapped.oracleId }, 'missing unwrapped price');
      setPrice(0);
      continue;
    }

    let price;
    if (!inverseRate) {
      price = wrappedRate.times(token0Price).dividedBy(RAY_DECIMALS).toNumber();
    } else if (unwrapped.oracleId === 'rsETH') {
      price = wrappedRate.times(token0Price).dividedBy('1e18').toNumber();
    } else {
      price = new BigNumber(token0Price)
        .times(getEDecimals(wrapped.decimals))
        .dividedBy(wrappedRate)
        .toNumber();
    }
    setPrice(price);
  }

  return results;
};

export const fetchWrappedAavePrices = async tokenPrices =>
  Promise.all([
    getWrappedAavePrices(tokenPrices, tokens.ethereum, ETH_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.polygon, POLYGON_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.optimism, OPTIMISM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.arbitrum, ARBITRUM_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.avax, AVAX_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.gnosis, GNOSIS_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.base, BASE_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.monad, MONAD_CHAIN_ID),
    getWrappedAavePrices(tokenPrices, tokens.sonic, SONIC_CHAIN_ID),
  ]).then(data =>
    data.flat().reduce((acc, cur, i) => ((acc[Object.values(tokens).flat()[i][1].oracleId] = cur), acc), {})
  );