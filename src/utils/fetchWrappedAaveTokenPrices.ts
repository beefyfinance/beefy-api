import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { addressBook } from '@beefyfinance/blockchain-addressbook';
import type { Token } from '@beefyfinance/blockchain-addressbook/types/token';
import { BigNumber } from 'bignumber.js';
import OrbETHAbi from '../abis/OrbETH.ts';
import rswETHAbi from '../abis/rswETH.ts';
import WrappedAave4626TokenAbi from '../abis/WrappedAave4626Token.ts';
import WrappedAaveTokenAbi from '../abis/WrappedAaveToken.ts';
import { fetchContract } from '../api/rpc/client.ts';
import type { PricesById } from '../types/prices.ts';
import { bigintDecimals } from './big-int.ts';
import { toChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { typedEntries } from './object.ts';
import { isValidPrice } from './prices.ts';
import { contextAllSettled, isContextResultRejected } from './promise.ts';
import { withTracing } from './tracing.ts';

const logger = getLoggerFor({ module: 'prices', component: 'aave-wrapped' });

const RAY_DECIMALS = 27;

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

type WrappedAaveTokenGroup = [unwrapped: Token, wrapped: Token, sourceType: SourceType];

const tokens = {
  ethereum: [
    [aUSDT, waUSDT, 'standard'],
    [aUSDC, waUSDC, 'standard'],
    [aDAI, waDAI, 'standard'],
    [aETH, waETH, 'standard'],
    [DAI, sDAI, 'erc4626'],
    [rsETH, rswETH, 'rswETH'],
    [DOLA, sDOLA, 'erc4626'],
    [ethUSDC, csUSDC, 'erc4626'],
    [USDL, wUSDL, 'erc4626'],
    [wUSDL, csUSDL, 'erc4626'],
    [aUSDT, waEthUSDT, 'erc4626'],
    [ethUSDC, waEthUSDC, 'erc4626'],
    [ethGHO, waEthLidoGHO, 'erc4626'],
    [USDe, waEthUSDe, 'erc4626'],
    [wstETH, waEthLidowstETH, 'erc4626'],
    [WETH, waEthLidoWETH, 'erc4626'],
    [WETH, fWETH, 'erc4626'],
    [wstETH, fwstETH, 'erc4626'],
    [WETH, waEthWETH, 'erc4626'],
  ],
  polygon: [
    [amUSDT, wamUSDT, 'standard'],
    [amUSDC, wamUSDC, 'standard'],
    [amDAI, wamDAI, 'standard'],
    [aWMATIC, waWMATIC, 'erc4626'],
    [aWETH, waWETH, 'erc4626'],
  ],
  optimism: [
    [optWETH, waOptWETH, 'erc4626'],
    [optwstETH, waOptwstETH, 'erc4626'],
    [optrETH, waOptrETH, 'erc4626'],
    [optUSDC, waOptUSDCn, 'erc4626'],
  ],
  arbitrum: [
    [aaWETH, waaWETH, 'erc4626'],
    [aaUSDT, waaUSDT, 'erc4626'],
    [aaUSDC, waaUSDC, 'erc4626'],
    [aaDAI, waaDAI, 'erc4626'],
    [DAI, gDAI, 'erc4626'],
    [aaUSDC, stataArbUSDCn, 'standard'],
    [aaUSDT, stataArbUSDTn, 'standard'],
    [USDC, gUSDC, 'erc4626'],
    [FRAX, stataArbFRAXn, 'standard'],
    [GHO, stataArbGHOn, 'standard'],
    [GHO, waArbGHO, 'erc4626'],
    [arbWETH, waArbWETH, 'erc4626'],
    [USDC, waArbUSDCn, 'erc4626'],
    [arbUSDT, waArbUSDT, 'erc4626'],
    [arbWBTC, waArbWBTC, 'erc4626'],
    [arbwstETH, waArbwstETH, 'erc4626'],
    [arbezETH, waArbezETH, 'erc4626'],
    [arbWETH, orbETH, 'orbETH'],
  ],
  avax: [
    [aavAVAX, waavAVAX, 'standard'],
    [aavUSDC, waavUSDC, 'standard'],
    [aavUSDT, waavUSDT, 'standard'],
    [WAVAX, waAvaWAVAX, 'erc4626'],
    [avaWETH, waAvaWETH, 'erc4626'],
    [BTCb, waAvaBTCb, 'erc4626'],
    [avaUSDC, waAvaUSDC, 'erc4626'],
  ],
  gnosis: [
    [EURA, stEUR, 'erc4626'],
    [agETH, wagETH, 'erc4626'],
    [agwstETH, wagwstETH, 'erc4626'],
    [agGNO, wagGNO, 'erc4626'],
  ],
  base: [
    [baseGHO, waBasGHO, 'erc4626'],
    [baseUSDC, waBasUSDC, 'erc4626'],
    [basewstETH, waBaswstETH, 'erc4626'],
    [baseezETH, waBasezETH, 'erc4626'],
    [baseWETH, waBasWETH, 'erc4626'],
    [baseUSDC, smUSDC, 'erc4626'],
  ],
  monad: [
    [WMON, cWMON, 'erc4626'],
    [AZND, loAZND, 'erc4626'],
    [USDT0, wnUSDT0, 'erc4626'],
    [AUSD, wnAUSD, 'erc4626'],
    [mUSDC, wnUSDC, 'erc4626'],
    [WMON, wnWMON, 'erc4626'],
    [gMON, wngMON, 'erc4626'],
    [shMON, wnshMON, 'erc4626'],
    [sMON, wnsMON, 'erc4626'],
    [loAZND, wnloAZND, 'erc4626'],
  ],
  sonic: [[S, wawS, 'erc4626']],
} satisfies Record<string, WrappedAaveTokenGroup[]>;

type Context = {
  wrapped: Token;
  unwrapped: Token;
  type: SourceType;
  chainId: ChainId;
};
type ReadRateFn = (ctx: Context) => Promise<bigint>;
type CalculatePriceFn = (rate: bigint, unwrappedPrice: number, ctx: Context) => number;
type SourceTypeFunctions = {
  readRate: ReadRateFn;
  calculatePrice: CalculatePriceFn;
};

const sourceTypes = {
  standard: {
    async readRate({ wrapped, chainId }: Context) {
      const contract = fetchContract(wrapped.address, WrappedAaveTokenAbi, chainId);
      return contract.read.rate();
    },
    calculatePrice(rate: bigint, unwrappedPrice: number) {
      return new BigNumber(rate).times(unwrappedPrice).shiftedBy(-RAY_DECIMALS).toNumber();
    },
  },
  erc4626: {
    async readRate({ wrapped, unwrapped, chainId }: Context) {
      const contract = fetchContract(wrapped.address, WrappedAave4626TokenAbi, chainId);
      return contract.read.convertToShares([bigintDecimals(unwrapped.decimals)]);
    },
    calculatePrice(rate: bigint, unwrappedPrice: number, { wrapped }: Context) {
      return new BigNumber(unwrappedPrice).shiftedBy(wrapped.decimals).dividedBy(rate).toNumber();
    },
  },
  rswETH: {
    async readRate({ wrapped, chainId }: Context) {
      const contract = fetchContract(wrapped.address, rswETHAbi, chainId);
      return contract.read.getRate();
    },
    calculatePrice(rate: bigint, unwrappedPrice: number) {
      return new BigNumber(rate).times(unwrappedPrice).shiftedBy(-18).toNumber();
    },
  },
  orbETH: {
    async readRate({ wrapped, chainId }: Context) {
      const contract = fetchContract(wrapped.address, OrbETHAbi, chainId);
      return contract.read.tokensPerLST();
    },
    calculatePrice(rate: bigint, unwrappedPrice: number, { wrapped }: Context) {
      return new BigNumber(unwrappedPrice).shiftedBy(wrapped.decimals).dividedBy(rate).toNumber();
    },
  },
} as const satisfies Record<string, SourceTypeFunctions>;

type SourceType = keyof typeof sourceTypes;

const getWrappedAavePrices = async (tokenPrices: PricesById, tokens: WrappedAaveTokenGroup[], chainId: ChainId) => {
  const contexts = tokens.map((tokenGroup): Context => {
    const [unwrapped, wrapped, type] = tokenGroup;
    return { unwrapped, wrapped, type, chainId };
  });

  const rateResults = await contextAllSettled(contexts, async (ctx: Context) => {
    const source = sourceTypes[ctx.type];
    if (!source) {
      throw new Error(`Incorrectly configured wrapped aave price, unexpected type ${ctx.type}`);
    }
    return source.readRate(ctx);
  });

  // sequential, so an entry can use the price of a wrapped token listed above it
  const prices: PricesById = {};
  for (const result of rateResults) {
    const { unwrapped, wrapped, type } = result.context;
    const fields = { chain: chainId, unwrapped: unwrapped.oracleId, wrapped: wrapped.oracleId };

    if (isContextResultRejected(result)) {
      logger.warn({ ...fields, err: result.reason }, 'failed to read rate');
      continue;
    }

    const rate = result.value;
    if (rate <= 0n) {
      logger.warn({ ...fields, rate }, 'invalid rate read');
      continue;
    }

    const unwrappedPrice = prices[unwrapped.oracleId] ?? tokenPrices[unwrapped.oracleId];
    if (!isValidPrice(unwrappedPrice)) {
      logger.warn(fields, 'missing unwrapped price');
      continue;
    }

    const price = sourceTypes[type].calculatePrice(rate, unwrappedPrice, result.context);
    if (!isValidPrice(price)) {
      logger.warn({ ...fields, price }, 'invalid price calculated');
      continue;
    }

    prices[wrapped.oracleId] = price;
  }

  return {
    chainId,
    prices,
  };
};

export const fetchWrappedAavePrices = withTracing(
  async (tokenPrices: PricesById): Promise<PricesById> => {
    const results = await Promise.all(
      typedEntries(tokens).map(([chain, chainTokens]) =>
        getWrappedAavePrices(tokenPrices, chainTokens, toChainId(chain))
      )
    );
    return results.reduce<PricesById>((acc, { prices }) => {
      Object.assign(acc, prices);
      return acc;
    }, {});
  },
  { logger }
);
