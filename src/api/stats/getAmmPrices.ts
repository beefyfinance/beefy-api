import { addressBookByChainId } from '@beefyfinance/blockchain-addressbook';
import type { BreakdownsById, PricesById } from '../../types/prices.ts';
import { getKey, setKey } from '../../utils/cache/index.ts';
import { fetchAmmPrices } from '../../utils/fetchAmmPrices.ts';
import { fetchBalancerLinearPoolPrice } from '../../utils/fetchBalancerStablePoolPrices.ts';
import { fetchChainLinkPrices } from '../../utils/fetchChainLinkPrices.ts';
import { fetchCoinGeckoPrices } from '../../utils/fetchCoinGeckoPrices.ts';
import { fetchConcentratedLiquidityTokenPrices } from '../../utils/fetchConcentratedLiquidityTokenPrices.ts';
import { fetchCurveTokenPrices } from '../../utils/fetchCurveTokenPrices.ts';
import { fetchDefillamaPrices } from '../../utils/fetchDefillamaPrices.ts';
import { fetchDexScreenerPriceOracles, type OraclePriceRequest } from '../../utils/fetchDexScreenerPrices.ts';
import { fetchErc4626TokenPrices } from '../../utils/fetchErc4626TokenPrices.ts';
import { fetchOptionTokenPrices } from '../../utils/fetchOptionTokenPrices.ts';
import { fetchSolidlyStableTokenPrices } from '../../utils/fetchSolidlyStableTokenPrices.ts';
import { fetchWrappedAavePrices } from '../../utils/fetchWrappedAaveTokenPrices.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { debugNativeWrappedPrices, normalizeNativeWrappedPrices } from '../../utils/normalizeNativeWrappedPrices.ts';
import { isFiniteNumber } from '../../utils/number.ts';
import { serviceEventBus } from '../../utils/ServiceEventBus.ts';
import { sleep } from '../../utils/time.ts';
import { getBeTokenPrices } from './getBeTokenPrices.ts';
import getNonAmmPrices from './getNonAmmPrices.ts';
import ramsesPools from '../../data/arbitrum/ramsesLpPools.json' with { type: 'json' };
import blackholePools from '../../data/avax/blackLpPools.json' with { type: 'json' };
import aerodromePools from '../../data/base/aerodromeLpPools.json' with { type: 'json' };
import alienBasePools from '../../data/base/alienBaseLpPools.json' with { type: 'json' };
import ooeV2Pools from '../../data/bsc/ooeV2LpPools.json' with { type: 'json' };
import pancakeBscLpPools from '../../data/bsc/pancakeLpPools.json' with { type: 'json' };
import kittenswapPools from '../../data/hyperevm/kittenswapLpPools.json' with { type: 'json' };
import etherexPools from '../../data/linea/etherexVolatilePools.json' with { type: 'json' };
import velodromeLiskPools from '../../data/lisk/velodromeLiskPools.json' with { type: 'json' };
import moePools from '../../data/mantle/moeLpPools.json' with { type: 'json' };
import netswapPools from '../../data/metis/netswapLpPools.json' with { type: 'json' };
import uniswapMonadPools from '../../data/monad/uniswapLpPools.json' with { type: 'json' };
import oldVelodromePools from '../../data/optimism/oldVelodromeLpPools.json' with { type: 'json' };
import velodromePools from '../../data/optimism/velodromeLpPools.json' with { type: 'json' };
import lithosPools from '../../data/plasma/lithosPools.json' with { type: 'json' };
import up33Pools from '../../data/robinhood/up33Pools.json' with { type: 'json' };
import defivePools from '../../data/sonic/defiveLpPools.json' with { type: 'json' };
import shadowPools from '../../data/sonic/shadowLpPools.json' with { type: 'json' };
import veSyncPools from '../../data/zksync/veSyncLpPools.json' with { type: 'json' };

const logger = getLoggerFor({ module: 'prices' });

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = normalizePoolOracleIds([
  ...up33Pools,
  ...pancakeBscLpPools,
  ...uniswapMonadPools,
  ...lithosPools,
  ...etherexPools,
  ...blackholePools,
  ...kittenswapPools,
  ...defivePools,
  ...shadowPools,
  ...velodromeLiskPools,
  ...moePools,
  ...alienBasePools,
  ...aerodromePools,
  ...ooeV2Pools,
  ...veSyncPools,
  ...ramsesPools,
  ...velodromePools,
  ...oldVelodromePools,
  ...netswapPools,
]);

/**
 * Map of coingecko ids to oracleIds
 * Each of these prices will be set as seed prices
 * Add here only as last resort if no other AMM price source is available
 * @see fetchSeedPrices
 */
const coinGeckoCoins: Record<string, string[]> = {
  'monerium-eur-money': ['EURe'],
  'cad-coin': ['CADC', 'jCAD'],
  xsgd: ['XSGD', 'jSGD'],
  nusd: ['sUSD'],
  'liquity-usd': ['LUSD'],
  seth: ['sETH'],
  'alchemix-usd': ['alUSD'],
  kava: ['KAVA', 'WKAVA'],
  'aura-finance': ['AURA'],
  'aura-bal': ['auraBAL'],
  'coinbase-wrapped-staked-eth': ['cbETH'],
  'opx-finance': ['OPX', 'beOPX'],
  'dola-usd': ['DOLA'],
  axlusdc: ['axlUSDC'],
  olympus: ['OHM'],
  'cow-protocol': ['COW'],
  'electronic-usd': ['eUSD'],
  //
  'gyroscope-gyd': ['GYD'],
  'renzo-restaked-eth': ['ezETH'],
  'qi-dao': ['QIv2'],
  'verified-usd-foundation-usdv': ['USDV'],
  'stake-dao-crv': ['sdCRV'],
  'kelp-dao-restaked-eth': ['rsETH'],
  'frax-ether': ['frxETH'],
  'stakestone-ether': ['STONE'],
  'alchemix-eth': ['alETH'],
  pepe: ['PEPE'],
  layerzero: ['ZRO'],
  'camelot-token': ['xGRAIL'],
  zksync: ['ZK'],
  'wrapped-oeth': ['WOETH'],
  'manta-network': ['MANTA'],
  'ether-fi': ['ETHFI'],
  'anzen-usdz': ['USDz'],
  chompcoin: ['CHOMP'],
  'davos-protocol': ['DUSD'],
  'synclub-staked-bnb': ['slisBNB'],
  'helio-protocol-hay': ['lisUSD'],
  'usual-usd': ['USD0'],
  'usd0-liquid-bond': ['USD0++'],
  usual: ['USUAL'],
  eth0: ['ETH0'],
  'badger-dao': ['BADGER'],
  'dinero-staked-eth': ['pxETH'],
  'based-pepe': ['basePEPE'],
  toshi: ['TOSHI'],
  somon: ['OwO'],
  'coinbase-wrapped-btc': ['cbBTC'],
  shezmuusd: ['ShezUSD'],
  shezmueth: ['ShezETH'],
  'knox-dollar': ['KNOX'],
  'gogopool-ggavax': ['ggAVAX'],
  'rif-token': ['RIF'],
  'dollar-on-chain': ['DOC'],
  'equilibria-finance-ependle': ['ePENDLE'],
  mpendle: ['mPENDLE'],
  penpie: ['PNP'],
  dogwifcoin: ['WIF'],
  scroll: ['SCR'],
  ankreth: ['ankrETH'],
  'usda-2': ['USDa'],
  'kim-token': ['xKIM', 'KIM'],
  'beets-staked-sonic': ['stS'],
  beets: ['BEETS'],
  'convex-fxs': ['cvxFXS'],
  'paypal-usd': ['BYUSD'],
  'stader-ethx': ['ETHx'],
  'liquid-bgt': ['LBGT'],
  'solv-btc': ['SolvBTC'],
  'agora-dollar': ['AUSD'],
  'falcon-finance': ['USDf'],
  'ripple-usd': ['RLUSD'],
  'staked-frax-usd': ['sfrxUSD'],
  susds: ['sUSDS'],
  'level-usd': ['lvlUSD'],
  'stake-link-staked-link': ['stLINK'],
  'spark-2': ['SPK'],
  'avant-staked-usd': ['savUSD'],
  'restaked-savax': ['rsAVAX'],
  'staked-stream-usd': ['xUSD'],
  'mu-digital-aznd': ['AZND'],
  'lombard-staked-btc': ['LBTC'],
  shmonad: ['shMON'],
  'kintsu-staked-monad': ['sMON'],
  're-protocol-reusd': ['reUSDxyz'],
  're-protocol-reusde': ['reUSDe'],
  // 'genesislrt-restaked-eth': ['lineainETH'],
  earnausd: ['earnAUSD'],
  'stakewise-v3-oseth': ['osETH'],
  'hemi-bitcoin': ['hemiBTC'],
  'origin-dollar': ['OUSD'],
  'mezo-usd': ['MUSD'],
  'yieldnest-rwa-max': ['ynRWAx'],
  'ynusd-max': ['ynUSDx'],
  'yneth-max': ['ynETHx'],
  'magma-staked-monad': ['gMON'],
  'paint-swap': ['BRUSH'],
  'steth-arm-lp-token': ['ARM-WETH-stETH'],
  gmx: ['GMX'],
  'curve-dao-token': ['CRV'],
  'convex-finance': ['CVX'],
  'worldcoin-wld': ['WLD'],
  'bridged-usdc-polygon-pos-bridge': ['pUSDCe'],
  xdai: ['WXDAI'],
  sky: ['SKY'],
  joe: ['JOE'],
  'yield-basis': ['YB'],
  'spell-token': ['SPELL'],
  arbitrum: ['ARB'],
  'savings-crvusd': ['scrvUSD'],
  'grove-2': ['GROVE'],
  'avant-usd': ['avUSD'],
  'cap-usd': ['cUSD'],
};

/**
 * Coins to fetch from dexscreener
 */
const dexscreenerCoins: OraclePriceRequest[] = [
  {
    oracleId: 'MIM',
    tokenAddress: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
    chainId: 'ethereum',
  },
  {
    oracleId: 'arbUSD+',
    tokenAddress: '0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65',
    chainId: 'arbitrum',
  },
  {
    oracleId: 'baseHAI',
    tokenAddress: '0x10398AbC267496E49106B07dd6BE13364D10dC71',
    chainId: 'optimism',
  },
  {
    oracleId: 'baseDOLA',
    tokenAddress: '0x4621b7A9c75199271F773Ebd9A499dbd165c3191',
    chainId: 'base',
  },
  {
    oracleId: 'basemsUSD',
    tokenAddress: '0x526728DBc96689597F85ae4cd716d4f7fCcBAE9d',
    chainId: 'base',
  },
  {
    oracleId: 'opmsUSD',
    tokenAddress: '0x9dAbAE7274D28A45F0B65Bf8ED201A5731492ca0',
    chainId: 'optimism',
  },
  {
    oracleId: 'msOP',
    tokenAddress: '0x33bCa143d9b41322479E8d26072a00a352404721',
    chainId: 'optimism',
  },
  {
    oracleId: 'baseETHFI',
    tokenAddress: '0x6C240DDA6b5c336DF09A4D011139beAAa1eA2Aa2',
    chainId: 'base',
  },
  {
    oracleId: 'OGN',
    tokenAddress: '0x7002458B1DF59EccB57387bC79fFc7C29E22e6f7',
    chainId: 'base',
  },
  {
    oracleId: 'scUSD',
    tokenAddress: '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
    chainId: 'sonic',
  },
  {
    oracleId: 'x33',
    tokenAddress: '0x3333111A391cC08fa51353E9195526A70b333333',
    chainId: 'sonic',
  },
  {
    oracleId: 'tETH',
    tokenAddress: '0xD11c452fc99cF405034ee446803b6F6c1F6d5ED8',
    chainId: 'ethereum',
  },
];

/**
 * Can use any oracleId set from chainlink or coingecko here
 * Runs after chainlink/coingecko/dexscreener prices are fetched but before any other price sources
 * Add here only as last resort if no other AMM price source is available
 * @see fetchSeedPrices
 */
const seedPeggedPrices = {
  WETH: 'ETH', // Wrapped native
  WBTC: 'BTC', // Wrapped native
  WMATIC: 'MATIC', // Wrapped native
  WAVAX: 'AVAX', // Wrapped native
  WBNB: 'BNB', // Wrapped native
  WKAVA: 'KAVA', // Wrapped native
  asUSDC: 'USDC', // Solana
  aUSDT: 'USDT', // Aave
  aDAI: 'DAI', // Aave
  aUSDC: 'USDC', // Aave
  aETH: 'ETH', // Aave
  amUSDT: 'USDT', // Aave
  amUSDC: 'USDC', // Aave
  amDAI: 'DAI', // Aave
  aaUSDT: 'USDT', // Aave
  aaUSDC: 'USDC', // Aave
  aArbUSDCn: 'USDC', // Aave
  aBasUSDC: 'USDC', // Aave
  aaDAI: 'DAI', // Aave
  aavAVAX: 'AVAX', // Aave
  aavUSDC: 'USDC', // Aave
  aavUSDT: 'USDT', // Aave
  'DAI+': 'DAI', // Overnight
  hETH: 'ETH', // HOP
  hDAI: 'DAI', // HOP
  hUSDC: 'USDC', // HOP
  hUSDT: 'USDT', // HOP
  aWMATIC: 'MATIC', // Aave
  aWETH: 'ETH', // Aave,
  cArbUSDCv3: 'USDC', // Compound
  aOptUSDC: 'USDC', // Aave
  aOptUSDCn: 'USDC', // Aave
  aSonUSDC: 'USDC', // Aave
  aLinUSDC: 'USDC', // Aave
  axlUSDC: 'USDC', // Axelar
  xcUSDC: 'USDC', // Kusama
  xcUSDT: 'USDT', // Kusama
  WSEI: 'SEI', // Wrapped SEI
  USDS: 'DAI',
  agETH: 'ETH', // Aave
  agwstETH: 'wstETH', // Aave
  agGNO: 'GNO', // Aave
  USDL: 'USDC',
  arbETHx: 'ETHx',
  WHYPE: 'HYPE',
  USDT0: 'USDT',
  USDCn: 'USDC',
  WMON: 'MON',
  USDCe: 'USDC',
};

const cachedTokenPrices: PricesById = {};
const cachedLpPrices: PricesById = {};
const cachedAllPrices: PricesById = {};
const cachedLpBreakdowns: BreakdownsById = {};

const ORACLES_TO_BE_CLEARED: string[] = [];

async function fetchSeedPrices() {
  logger.debug('fetching seed prices from external apis');

  try {
    const [seedPrices, coinGeckoPrices, defillamaPrices, dexscreenerPrices] = await Promise.all([
      // ChainLink gives: ETH, BTC, MATIC, AVAX, BNB, LINK, USDT, DAI, USDC
      fetchChainLinkPrices().catch((err): PricesById => {
        logger.warn({ err }, 'chainlink fetch failed');
        return {};
      }),
      fetchCoinGeckoPrices(Object.keys(coinGeckoCoins)).catch((err): PricesById => {
        logger.warn({ err }, 'coingecko fetch failed');
        return {};
      }),
      fetchDefillamaPrices(Object.keys(coinGeckoCoins)).catch((err): PricesById => {
        logger.warn({ err }, 'defillama fetch failed');
        return {};
      }),
      fetchDexScreenerPriceOracles(dexscreenerCoins).catch((err): PricesById => {
        logger.warn({ err }, 'dexscreener fetch failed');
        return {};
      }),
    ]);

    logger.debug(
      {
        chainLink: Object.keys(seedPrices).length,
        coinGecko: Object.keys(coinGeckoPrices).length,
        defillama: Object.keys(defillamaPrices).length,
        dexScreener: Object.keys(dexscreenerPrices).length,
      },
      'seed prices fetched'
    );

    // CoinGecko
    for (const [geckoId, oracleIds] of Object.entries(coinGeckoCoins)) {
      for (const oracleId of oracleIds) {
        const cg = coinGeckoPrices[geckoId];
        const dl = defillamaPrices[geckoId];
        if (!cg) seedPrices[oracleId] = dl;
        else if (!dl) seedPrices[oracleId] = cg;
        else {
          seedPrices[oracleId] = cg;
          const diff = (Math.abs(cg - dl) / cg) * 100;
          if (diff > 10) {
            logger.warn({ token: oracleId, cg, dl }, 'coingecko and defillama price too different');
          }
        }
      }
    }

    // DexScreener
    for (const [oracleId, price] of Object.entries(dexscreenerPrices)) {
      seedPrices[oracleId] = price;
    }

    // Set pegged prices
    for (const [oracle, peggedOracle] of Object.entries(seedPeggedPrices)) {
      if (peggedOracle in seedPrices) {
        seedPrices[oracle] = seedPrices[peggedOracle];
      } else {
        logger.warn({ oracle, peggedOracle }, 'pegged oracle not found');
      }
    }

    // Static
    seedPrices['GAS'] = 0; // Saga, users don't pay for gas

    logger.debug({ count: Object.keys(seedPrices).length }, 'total seed prices');
    return normalizeNativeWrappedPrices(seedPrices);
  } catch (error) {
    logger.warn({ err: error }, 'failed to fetch seed prices');
    return {};
  }
}

/** depend only on the amm token prices */
async function fetchDerivedTokenPrices(ammTokenPrices: PricesById): Promise<PricesById> {
  const [beTokenPrices, curvePrices, solidlyStablePrices, linearPoolPrices, optionPrices, erc4626Prices] =
    await Promise.all([
      getBeTokenPrices(ammTokenPrices),
      fetchCurveTokenPrices(ammTokenPrices),
      fetchSolidlyStableTokenPrices(ammTokenPrices),
      fetchWrappedAaveAndDependantPrices(ammTokenPrices),
      fetchCowcentratedAndDependantPrices(ammTokenPrices),
      fetchErc4626TokenPrices(ammTokenPrices),
    ]);

  return {
    ...ammTokenPrices,
    ...beTokenPrices,
    ...curvePrices,
    ...solidlyStablePrices,
    ...linearPoolPrices,
    ...optionPrices,
    ...erc4626Prices,
  };
}

async function fetchCowcentratedAndDependantPrices(tokenPrices: PricesById): Promise<PricesById> {
  const concLiqPrices = await fetchConcentratedLiquidityTokenPrices(tokenPrices);
  const optionPrices = await fetchOptionTokenPrices({ ...tokenPrices, ...concLiqPrices });

  return {
    ...optionPrices,
    ...concLiqPrices,
  };
}

async function fetchWrappedAaveAndDependantPrices(tokenPrices: PricesById): Promise<PricesById> {
  const wrappedAavePrices = await fetchWrappedAavePrices(tokenPrices);
  const linearPrices = await fetchBalancerLinearPoolPrice({ ...tokenPrices, ...wrappedAavePrices });

  return {
    ...linearPrices,
    ...wrappedAavePrices,
  };
}

/** needs the fully merged token prices, so it can only start once every derived price is in */
async function fetchLpData(tokenPrices: PricesById, poolPrices: PricesById, lpsBreakdown: BreakdownsById) {
  const nonAmmPrices = await getNonAmmPrices(tokenPrices, poolPrices);

  return {
    prices: { ...poolPrices, ...nonAmmPrices.prices },
    breakdown: { ...lpsBreakdown, ...nonAmmPrices.breakdown },
  };
}

async function performUpdateAmmPrices() {
  const startTime = Date.now();

  // Seed with chain link + coin gecko prices
  const knownPrices = await fetchSeedPrices();
  logger.debug({ count: Object.keys(knownPrices).length, durationMs: Date.now() - startTime }, 'seed prices fetched');

  const { tokenPrices: ammTokenPrices, poolPrices, lpsBreakdown } = await fetchAmmPrices(pools, knownPrices);

  const tokenPrices = await fetchDerivedTokenPrices(ammTokenPrices);
  const { prices: lpPrices, breakdown: lpBreakdown } = await fetchLpData(tokenPrices, poolPrices, lpsBreakdown);

  logger.debug({ durationMs: Date.now() - startTime }, 'performUpdateAmmPrices completed');

  return { tokenPrices, lpPrices, lpBreakdown };
}

async function updateAmmPrices() {
  logger.info('updating amm prices');
  const start = Date.now();

  try {
    const { tokenPrices, lpPrices, lpBreakdown } = await performUpdateAmmPrices();
    const normalizedTokenPrices = normalizeNativeWrappedPrices(tokenPrices);

    debugNativeWrappedPrices(normalizedTokenPrices, 'updateAmmPrices');

    if (addToCache(normalizedTokenPrices, lpPrices, lpBreakdown)) {
      logger.debug('cache updated, saving to redis');
      clearCacheOracles(); // Delete specific oracleIds
      await saveToRedis();
      logger.debug('redis save complete');
    }

    logger.info({ durationMs: Date.now() - start }, 'updated amm prices');
  } catch (err) {
    logger.warn({ err, durationMs: Date.now() - start }, 'error updating amm prices');
  } finally {
    setTimeout(updateAmmPrices, REFRESH_INTERVAL);
  }
}

export async function getAmmTokensPrices() {
  try {
    await serviceEventBus.waitForFirstEvent('prices/tokens/updated'); // 1 minute timeout
    return cachedTokenPrices;
  } catch (error) {
    logger.warn({ err: error }, 'timeout waiting for prices/tokens/updated, returning cached data');
    return cachedTokenPrices;
  }
}

export async function getAmmLpPrices() {
  try {
    await serviceEventBus.waitForFirstEvent('prices/lps/updated'); // 1 minute timeout
    return cachedLpPrices;
  } catch (error) {
    logger.warn({ err: error }, 'timeout waiting for prices/lps/updated, returning cached data');
    return cachedLpPrices;
  }
}

export async function getAmmAllPrices() {
  try {
    await serviceEventBus.waitForFirstEvent('prices/updated'); // 1 minute timeout
    return cachedAllPrices;
  } catch (error) {
    logger.warn({ err: error }, 'timeout waiting for prices/updated, returning cached data');
    return cachedAllPrices;
  }
}

export async function getLpBreakdown() {
  try {
    await serviceEventBus.waitForFirstEvent('prices/lp-breakdowns/updated'); // 1 minute timeout
    return cachedLpBreakdowns;
  } catch (error) {
    logger.warn({ err: error }, 'timeout waiting for prices/lp-breakdowns/updated, returning cached data');
    return cachedLpBreakdowns;
  }
}

export async function getLpBreakdownForOracle(oracleId: string) {
  const breakdowns = await getLpBreakdown();
  return breakdowns[oracleId];
}

export async function getAmmTokenPrice(
  oracleId: string,
  withUnknownLogging: boolean | string = false
): Promise<number | undefined> {
  const tokenPrices = await getAmmTokensPrices();
  if (tokenPrices.hasOwnProperty(oracleId)) {
    return tokenPrices[oracleId];
  }

  if (withUnknownLogging) {
    logger.warn(
      { token: oracleId },
      `unknown oracleId in tokens oracle. ${
        withUnknownLogging === true ? 'Consider adding it to .json file' : withUnknownLogging
      }`
    );
  }
}

export async function getAmmLpPrice(
  oracleId: string,
  withUnknownLogging: boolean | string = false
): Promise<number | undefined> {
  const lpPrices = await getAmmLpPrices();
  if (lpPrices.hasOwnProperty(oracleId)) {
    return lpPrices[oracleId];
  }

  if (withUnknownLogging) {
    logger.warn(
      { token: oracleId },
      `unknown oracleId in lps oracle. ${
        withUnknownLogging === true ? 'Consider adding it to .json file' : withUnknownLogging
      }`
    );
  }
}

export async function getAmmPrice(
  oracleId: string,
  withUnknownLogging: boolean | string = false
): Promise<number | undefined> {
  const allPrices = await getAmmAllPrices();
  if (allPrices.hasOwnProperty(oracleId)) {
    return allPrices[oracleId];
  }

  if (withUnknownLogging) {
    logger.warn(
      { token: oracleId },
      `unknown oracleId in any oracle. ${
        withUnknownLogging === true ? 'Consider adding it to .json file' : withUnknownLogging
      }`
    );
  }
}

/**
 * Use wrapped oracleId for both wrapped and native tokens when resolving prices
 * After resolving {@see fetchAmmPrices} we copy wrapped price to native price
 */
function normalizePoolOracleIds<T extends { lp0: { oracleId: string }; lp1: { oracleId: string } }>(pools: T[]): T[] {
  const nativeToWrappedOracleId = new Map<string, string>(
    Object.values(addressBookByChainId).map(chainBook => [chainBook.native.oracleId, chainBook.tokens.WNATIVE.oracleId])
  );

  pools.forEach(pool => {
    const fields = ['lp0', 'lp1'] as const;
    fields.forEach(token => {
      const wrappedOracleId = nativeToWrappedOracleId.get(pool[token].oracleId);
      if (wrappedOracleId) {
        pool[token].oracleId = wrappedOracleId;
      }
    });
  });

  return pools;
}

function addTokenPricesToCache(tokenPrices: PricesById): boolean {
  let updated = false;

  for (const [token, price] of Object.entries(tokenPrices)) {
    if (isFiniteNumber(price)) {
      // TODO: add TTL so entries are removed eventually if not updated
      cachedTokenPrices[token] = price;
      cachedAllPrices[token] = price;
      updated = true;
    }
  }

  return updated;
}

function addLpPricesToCache(tokenPrices: PricesById): boolean {
  let updated = false;

  for (const [token, price] of Object.entries(tokenPrices)) {
    if (isFiniteNumber(price)) {
      // TODO: add TTL so entries are removed eventually if not updated
      cachedLpPrices[token] = price;
      cachedAllPrices[token] = price;
      updated = true;
    }
  }

  return updated;
}

function addLpBreakdownsToCache(lpBreakdowns: BreakdownsById): boolean {
  let updated = false;

  for (const [token, breakdown] of Object.entries(lpBreakdowns)) {
    if (breakdown !== undefined && breakdown !== null && typeof breakdown === 'object' && 'price' in breakdown) {
      const price = breakdown.price;
      if (isFiniteNumber(price)) {
        // TODO: add TTL so entries are removed eventually if not updated
        cachedLpBreakdowns[token] = breakdown;
        updated = true;
      }
    }
  }

  return updated;
}

function addToCache(tokenPrices: PricesById, lpPrices: PricesById, lpBreakdowns: BreakdownsById): boolean {
  const tokenPriceUpdated = addTokenPricesToCache(tokenPrices);
  const lpPriceUpdated = addLpPricesToCache(lpPrices);
  const lpBreakdownUpdated = addLpBreakdownsToCache(lpBreakdowns);

  if (tokenPriceUpdated) {
    serviceEventBus.emit('prices/tokens/updated');
  }

  if (lpPriceUpdated) {
    serviceEventBus.emit('prices/lps/updated');
  }

  if (lpBreakdownUpdated) {
    serviceEventBus.emit('prices/lp-breakdowns/updated');
  }

  if (tokenPriceUpdated || lpPriceUpdated) {
    serviceEventBus.emit('prices/updated');
  }

  return tokenPriceUpdated || lpPriceUpdated || lpBreakdownUpdated;
}

export async function initPriceService() {
  logger.debug('starting initialization');

  try {
    // Load cache and update with timeout
    logger.debug('loading from redis');
    await Promise.race([
      loadFromRedis(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis load timeout')), 30000)),
    ]);
    logger.debug('redis load complete');

    logger.debug('initial delay');
    await sleep(INIT_DELAY);

    logger.debug('starting first price update');
    await updateAmmPrices();
    logger.debug('initialization complete');
  } catch (error) {
    logger.error({ err: error }, 'initialization failed');
    throw error;
  }
}

async function loadFromRedis() {
  const tokenPrices = await getKey<PricesById>('TOKEN_PRICES');
  const lpPrices = await getKey<PricesById>('LP_PRICES');
  const lpBreakdowns = await getKey<BreakdownsById>('LP_BREAKDOWN');

  addToCache(
    tokenPrices && typeof tokenPrices === 'object' ? tokenPrices : {},
    lpPrices && typeof lpPrices === 'object' ? lpPrices : {},
    lpBreakdowns && typeof lpBreakdowns === 'object' ? lpBreakdowns : {}
  );
}

function clearCacheOracles() {
  ORACLES_TO_BE_CLEARED.forEach(oracleId => {
    delete cachedTokenPrices[oracleId];
    delete cachedLpPrices[oracleId];
    delete cachedAllPrices[oracleId];
    delete cachedLpBreakdowns[oracleId];
  });
}

async function saveToRedis() {
  await setKey('TOKEN_PRICES', cachedTokenPrices);
  await setKey('LP_PRICES', cachedLpPrices);
  await setKey('LP_BREAKDOWN', cachedLpBreakdowns);
}
