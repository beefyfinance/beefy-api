`use strict`;

import { fetchAmmPrices } from '../../utils/fetchAmmPrices';
import { fetchMooPrices } from '../../utils/fetchMooPrices';
import { fetchXPrices } from '../../utils/fetchXPrices';
import { fetchOptionTokenPrices } from '../../utils/fetchOptionTokenPrices';
import { fetchWrappedAavePrices } from '../../utils/fetchWrappedAaveTokenPrices';
import { fetchUnwrappedAavePrices } from '../../utils/fetchUnwrappedAaveTokenPrices';
import { fetchJbrlPrice } from '../../utils/fetchJbrlPrice';
import { fetchyVaultPrices } from '../../utils/fetchyVaultPrices';
import { fetchCurveTokenPrices } from '../../utils/fetchCurveTokenPrices';
import { fetchConcentratedLiquidityTokenPrices } from '../../utils/fetchConcentratedLiquidityTokenPrices';
import { fetchSolidlyStableTokenPrices } from '../../utils/fetchSolidlyStableTokenPrices';
import {
  fetchBalancerLinearPoolPrice,
  fetchBalancerStablePoolPrice,
} from '../../utils/fetchBalancerStablePoolPrices';
import { fetchCoinGeckoPrices } from '../../utils/fetchCoinGeckoPrices';
import { fetchDefillamaPrices } from '../../utils/fetchDefillamaPrices';
import { getKey, setKey } from '../../utils/cache';

import getNonAmmPrices from './getNonAmmPrices';
import ellipsisPools from '../../data/bsc/ellipsisLpPools.json';
import mdexBscPools from '../../data/bsc/mdexBscLpPools.json';
import oldPools from '../../data/archive/oldLpPools.json';
import mooTokens from '../../data/mooTokens.json';
import vvsPools from '../../data/cronos/vvsLpPools.json';
import cronaPools from '../../data/cronos/cronaLpPools.json';
import liquidusPools from '../../data/cronos/liquidusLpPools.json';
import netswapPools from '../../data/metis/netswapLpPools.json';
import stellaswapPools from '../../data/moonbeam/stellaswapLpPools.json';
import stellaswapPoolsV2 from '../../data/moonbeam/stellaswapLpV2Pools.json';
import darkCryptoPools from '../../data/cronos/darkCryptoLpPools.json';
import solarflare from '../../data/moonbeam/solarFlareLpPools.json';
import vvsDualPools from '../../data/cronos/vvsDualLpPools.json';
import velodromePools from '../../data/optimism/velodromeLpPools.json';
import oldVelodromePools from '../../data/optimism/oldVelodromeLpPools.json';
import ripaeCronosPools from '../../data/cronos/ripaeLpPools.json';
import thenaPools from '../../data/bsc/thenaLpPools.json';
import cantoLpPools from '../../data/canto/cantoLpPools.json';
import solidLizardPools from '../../data/arbitrum/solidlizardLpPools.json';
import velocimeterV2Pools from '../../data/canto/velocimeterV2LpPools.json';
import equilibrePools from '../../data/kava/equilibreLpPools.json';
import versePools from '../../data/ethereum/verseLpPools.json';
import ramsesPools from '../../data/arbitrum/ramsesLpPools.json';
import velocorePools from '../../data/zksync/velocoreLpPools.json';
import veSyncPools from '../../data/zksync/veSyncLpPools.json';
import baseSwapPools from '../../data/base/baseSwapLpPools.json';
import ooeV2Pools from '../../data/bsc/ooeV2LpPools.json';
import draculaPools from '../../data/zksync/draculaLpPools.json';
import aerodromePools from '../../data/base/aerodromeLpPools.json';
import alienBasePools from '../../data/base/alienBaseLpPools.json';
import moePools from '../../data/mantle/moeLpPools.json';
import lynexPools from '../../data/linea/lynexVolatilePools.json';
import nilePools from '../../data/linea/nileVolatilePools.json';
import raPools from '../../data/fraxtal/raPools.json';
import nuriPools from '../../data/scroll/nuriVolatilePools.json';
import tokanPools from '../../data/scroll/tokanVolatilePools.json';
import velodromeModePools from '../../data/mode/velodromeModePools.json';
import velodromeLiskPools from '../../data/lisk/velodromeLiskPools.json';
import equalizerSonicPools from '../../data/sonic/equalizerLpPools.json';
import shadowPools from '../../data/sonic/shadowLpPools.json';
import defivePools from '../../data/sonic/defiveLpPools.json';
import truePools from '../../data/base/trueLpPools.json';
import { addressBookByChainId } from '../../../packages/address-book/src/address-book';
import { sleep } from '../../utils/time';
import { isFiniteNumber } from '../../utils/number';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { fetchChainLinkPrices } from '../../utils/fetchChainLinkPrices';
import { fetchVenusPrices } from './bsc/venus/getVenusPrices';
import { getLpBasedPrices } from './getLpBasedPrices';
import { fetchDexScreenerPriceOracles, OraclePriceRequest } from '../../utils/fetchDexScreenerPrices';
import { promiseTiming } from '../../utils/timing';
import { getBeTokenPrices } from './getBeTokenPrices';
import {
  debugNativeWrappedPrices,
  normalizeNativeWrappedPrices,
} from '../../utils/normalizeNativeWrappedPrices';

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = normalizePoolOracleIds([
  ...truePools,
  ...defivePools,
  ...shadowPools,
  ...equalizerSonicPools,
  ...velodromeLiskPools,
  ...velodromeModePools,
  ...tokanPools,
  ...nuriPools,
  ...raPools,
  ...moePools,
  ...lynexPools,
  ...nilePools,
  ...alienBasePools,
  ...aerodromePools,
  ...draculaPools,
  ...ooeV2Pools,
  ...baseSwapPools,
  ...veSyncPools,
  ...velocorePools,
  ...ramsesPools,
  ...versePools,
  ...equilibrePools,
  ...velocimeterV2Pools,
  ...solidLizardPools,
  ...cantoLpPools,
  ...thenaPools,
  ...ripaeCronosPools,
  ...velodromePools,
  ...oldVelodromePools,
  ...vvsDualPools,
  ...stellaswapPools,
  ...stellaswapPoolsV2,
  ...solarflare,
  ...darkCryptoPools,
  ...netswapPools,
  ...liquidusPools,
  ...oldPools,
  ...cronaPools,
  ...vvsPools,
  ...mdexBscPools,
  ...ellipsisPools,
]);

/**
 * Map of coingecko ids to oracleIds
 * Each of these prices will be set as seed prices
 * Add here only as last resort if no other AMM price source is available
 * @see fetchSeedPrices
 */
const coinGeckoCoins: Record<string, string[]> = {
  'stasis-eurs': ['EURS'],
  'tether-eurt': ['EURt'],
  'par-stablecoin': ['PAR'],
  'monerium-eur-money': ['EURe'],
  jpyc: ['JPYC', 'jJPY'],
  'cad-coin': ['CADC', 'jCAD'],
  xsgd: ['XSGD', 'jSGD'],
  'usd-balance': ['USDB'],
  gelato: ['GEL'],
  'perpetual-protocol': ['PERP'],
  nusd: ['sUSD'],
  'lyra-finance': ['LYRA'],
  'liquity-usd': ['LUSD'],
  seth: ['sETH'],
  'alchemix-usd': ['alUSD'],
  kava: ['KAVA', 'WKAVA'],
  'aura-finance': ['AURA'],
  havven: ['hSNX'],
  'aura-bal': ['auraBAL'],
  'coinbase-wrapped-staked-eth': ['cbETH'],
  'opx-finance': ['OPX', 'beOPX'],
  'dola-usd': ['DOLA'],
  'across-protocol': ['ACX'],
  'metavault-trade': ['MVX'],
  seur: ['sEUR'],
  euler: ['EUL'],
  axlusdc: ['axlUSDC'],
  'mimo-parallel-governance-token': ['MIMO'],
  olympus: ['OHM'],
  'ankr-reward-bearing-ftm': ['ankrFTM'],
  lucha: ['LUCHA'],
  'cow-protocol': ['COW'],
  'electronic-usd': ['eUSD'],
  // 'overnight-finance': ['OVN'],
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
  foxy: ['FOXY'],
  'ether-fi': ['ETHFI'],
  'anzen-usdz': ['USDz'],
  chompcoin: ['CHOMP'],
  'davos-protocol': ['DUSD'],
  'synclub-staked-bnb': ['slisBNB'],
  'helio-protocol-hay': ['lisUSD'],
  'usual-usd': ['USD0'],
  'usd0-liquid-bond': ['USD0++'],
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
  moonbeam: ['GLMR'],
  scroll: ['SCR'],
  'binance-bitcoin': ['BTCB'],
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
  'solv-protocol-solvbtc-bbn': ['xSolvBTC'],
  'agora-dollar': ['AUSD'],
  'falcon-finance': ['USDf'],
  'ripple-usd': ['RLUSD'],
  'staked-frax-usd': ['sfrxUSD'],
  susds: ['sUSDS'],
  'stake-link-staked-link': ['stLINK'],
};

/**
 * Coins to fetch from dexscreener
 */
const dexscreenerCoins: OraclePriceRequest[] = [
  {
    oracleId: 'arbUSD+',
    tokenAddress: '0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65',
    chainId: 'arbitrum',
  },
  {
    oracleId: 'mantleUSDe',
    tokenAddress: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
    chainId: 'mantle',
  },
  {
    oracleId: 'baseHAI',
    tokenAddress: '0x10398AbC267496E49106B07dd6BE13364D10dC71',
    chainId: 'optimism',
  },
  {
    oracleId: 'lineainETH',
    tokenAddress: '0x5A7a183B6B44Dc4EC2E3d2eF43F98C5152b1d76d',
    chainId: 'linea',
  },
  {
    oracleId: 'baseDOLA',
    tokenAddress: '0x4621b7A9c75199271F773Ebd9A499dbd165c3191',
    chainId: 'base',
  },
  {
    oracleId: 'lineaZERO',
    tokenAddress: '0x78354f8DcCB269a615A7e0a24f9B0718FDC3C7A7',
    chainId: 'linea',
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
    oracleId: 'arbXVS',
    tokenAddress: '0xc1Eb7689147C81aC840d4FF0D298489fc7986d52',
    chainId: 'arbitrum',
  },
  {
    oracleId: 'scUSD',
    tokenAddress: '0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE',
    chainId: 'sonic',
  },
  {
    oracleId: 'LUDWIG',
    tokenAddress: '0xe6cc4D855B4fD4A9D02F46B9adae4C5EfB1764B5',
    chainId: 'sonic',
  },
  {
    oracleId: 'x33',
    tokenAddress: '0x3333111A391cC08fa51353E9195526A70b333333',
    chainId: 'sonic',
  },
  {
    oracleId: 'BeetsFragmentsS1',
    tokenAddress: '0x3419966bC74fa8f951108d15b053bEd233974d3D',
    chainId: 'sonic',
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
};

export type BaseLpBreakdown = {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
};
export type ClmLpBreakdown = BaseLpBreakdown & {
  underlyingLiquidity: string;
  underlyingBalances: string[];
  underlyingPrice: number;
};
export type LpBreakdown = BaseLpBreakdown | ClmLpBreakdown;
export type PricesById = Record<string, number>;
export type BreakdownsById = Record<string, LpBreakdown>;

const cachedTokenPrices: PricesById = {};
const cachedLpPrices: PricesById = {};
const cachedAllPrices: PricesById = {};
const cachedLpBreakdowns: BreakdownsById = {};

const ORACLES_TO_BE_CLEARED = [];

async function fetchSeedPrices() {
  const [seedPrices, coinGeckoPrices, defillamaPrices, dexscreenerPrices] = await Promise.all([
    // ChainLink gives: ETH, BTC, MATIC, AVAX, BNB, LINK, USDT, DAI, USDC
    fetchChainLinkPrices(),
    fetchCoinGeckoPrices(Object.keys(coinGeckoCoins)),
    fetchDefillamaPrices(Object.keys(coinGeckoCoins)),
    fetchDexScreenerPriceOracles(dexscreenerCoins),
  ]);

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
          console.log(oracleId, 'price on CoinGecko and Defillama is too different', cg, dl);
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
      console.error(`Pegged oracle ${peggedOracle} not found for ${oracle}`);
    }
  }

  // Static
  seedPrices['GAS'] = 0; // Saga, users don't pay for gas

  return normalizeNativeWrappedPrices(seedPrices);
}

async function performUpdateAmmPrices() {
  // Seed with chain link + coin gecko prices
  const knownPrices = await fetchSeedPrices();

  const ammPrices = fetchAmmPrices(pools, knownPrices);

  const venusPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await promiseTiming(fetchVenusPrices(tokenPrices), 'fetchVenusPrices');
  });

  const curveTokenPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await promiseTiming(fetchCurveTokenPrices(tokenPrices), 'fetchCurveTokenPrices');
  });

  const solidlyStableTokenPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await promiseTiming(fetchSolidlyStableTokenPrices(tokenPrices), 'fetchSolidlyStableTokenPrices');
  });

  const xPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await promiseTiming(fetchXPrices(tokenPrices), 'fetchXPrices');
  });

  const mooPrices = ammPrices.then(async ({ poolPrices, tokenPrices }) => {
    return await promiseTiming(fetchMooPrices(mooTokens, tokenPrices, poolPrices), 'fetchMooPrices');
  });

  const optionPrices = ammPrices.then(async ({ tokenPrices }) => {
    const concLiqPrices = await promiseTiming(
      fetchConcentratedLiquidityTokenPrices(tokenPrices),
      'fetchConcentratedLiquidityTokenPrices'
    );
    const prices = { ...tokenPrices, ...concLiqPrices };
    const optionPrices = await promiseTiming(fetchOptionTokenPrices(prices), 'fetchOptionTokenPrices');
    return {
      ...optionPrices,
      ...concLiqPrices,
    };
  });

  const linearPoolPrice = ammPrices.then(async ({ tokenPrices }): Promise<Record<string, number>> => {
    const jbrlTokenPrice = await promiseTiming(fetchJbrlPrice(), 'fetchJbrlPrice');
    const yVaultPrices = await promiseTiming(fetchyVaultPrices(tokenPrices), 'fetchyVaultPrices');
    const wrappedAavePrices = await promiseTiming(
      fetchWrappedAavePrices(tokenPrices),
      'fetchWrappedAavePrices'
    );
    const unwrappedAavePrices = await promiseTiming(
      fetchUnwrappedAavePrices(tokenPrices),
      'fetchUnwrappedAavePrices'
    );
    const prices = {
      ...tokenPrices,
      ...wrappedAavePrices,
      ...unwrappedAavePrices,
      ...jbrlTokenPrice,
      ...yVaultPrices,
    };

    const linearPrices = await promiseTiming(
      fetchBalancerLinearPoolPrice(prices),
      'fetchBalancerLinearPoolPrice'
    );
    const balancerStablePoolPrice = await promiseTiming(
      fetchBalancerStablePoolPrice(linearPrices),
      'fetchBalancerStablePoolPrice'
    );

    return {
      ...linearPrices,
      ...balancerStablePoolPrice,
      ...wrappedAavePrices,
      ...unwrappedAavePrices,
      ...jbrlTokenPrice,
      ...yVaultPrices,
    };
  });

  const beTokenPrice = ammPrices.then(async ({ tokenPrices }) => {
    return getBeTokenPrices(tokenPrices);
  });

  const tokenPrices = ammPrices.then(async ({ tokenPrices }) => {
    const curvePrices = await curveTokenPrices;
    const solidlyStablePrices = await solidlyStableTokenPrices;
    const xTokenPrices = await xPrices;
    const mooTokenPrices = await mooPrices;
    const beTokenTokenPrice = await beTokenPrice;
    const linearPoolTokenPrice = await linearPoolPrice;
    const venusTokenPrice = await venusPrices;
    const optionTokenPrice = await optionPrices;
    return {
      ...tokenPrices,
      ...mooTokenPrices,
      ...xTokenPrices,
      ...beTokenTokenPrice,
      ...curvePrices,
      ...solidlyStablePrices,
      ...linearPoolTokenPrice,
      ...venusTokenPrice,
      ...optionTokenPrice,
    };
  });

  const lpData = ammPrices.then(async ({ poolPrices, lpsBreakdown }) => {
    const nonAmmPrices = await promiseTiming(
      getNonAmmPrices(await tokenPrices, poolPrices),
      'getNonAmmPrices'
    );
    const pendlePrices = await promiseTiming(
      getLpBasedPrices(await tokenPrices, poolPrices, nonAmmPrices),
      'getLpBasedPrices'
    );

    return {
      prices: { ...poolPrices, ...nonAmmPrices.prices, ...pendlePrices.prices },
      breakdown: {
        ...lpsBreakdown,
        ...nonAmmPrices.breakdown,
        ...pendlePrices.breakdown,
      },
    };
  });

  const lpBreakdown = lpData.then(({ breakdown }) => breakdown);
  const lpPrices = lpData.then(({ prices }) => prices);

  await tokenPrices;
  await lpData;

  return {
    tokenPrices,
    lpPrices,
    lpBreakdown,
  };
}

async function updateAmmPrices() {
  console.log('> updating amm prices');
  let start = Date.now();

  try {
    const {
      tokenPrices: tokenPricesPromise,
      lpPrices: lpPricesPromise,
      lpBreakdown: lpBreakdownPromise,
    } = await performUpdateAmmPrices();

    const [tokenPrices, lpPrices, lpBreakdowns] = await Promise.all([
      tokenPricesPromise.then(normalizeNativeWrappedPrices),
      lpPricesPromise,
      lpBreakdownPromise,
    ]);

    debugNativeWrappedPrices(tokenPrices, 'updateAmmPrices');

    if (addToCache(tokenPrices, lpPrices, lpBreakdowns)) {
      clearCacheOracles(); // Delete specific oracleIds
      await saveToRedis();
    }

    console.log(`> updated amm prices  (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error(`> error updating amm prices (${(Date.now() - start) / 1000}s)`, err.message);
  } finally {
    setTimeout(updateAmmPrices, REFRESH_INTERVAL);
  }
}

export async function getAmmTokensPrices() {
  await serviceEventBus.waitForFirstEvent('prices/tokens/updated');
  return cachedTokenPrices;
}

export async function getAmmLpPrices() {
  await serviceEventBus.waitForFirstEvent('prices/lps/updated');
  return cachedLpPrices;
}

export async function getAmmAllPrices() {
  await serviceEventBus.waitForFirstEvent('prices/updated');
  return cachedAllPrices;
}

export async function getLpBreakdown() {
  await serviceEventBus.waitForFirstEvent('prices/lp-breakdowns/updated');
  return cachedLpBreakdowns;
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
    console.warn(
      `Unknown oracleId '${oracleId}' in tokens oracle. ${
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
    console.warn(
      `Unknown oracleId '${oracleId}' in lps oracle. ${
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
    console.warn(
      `Unknown oracleId '${oracleId}' in any oracle. ${
        withUnknownLogging === true ? 'Consider adding it to .json file' : withUnknownLogging
      }`
    );
  }
}

/**
 * Use wrapped oracleId for both wrapped and native tokens when resolving prices
 * After resolving {@see fetchAmmPrices} we copy wrapped price to native price
 */
function normalizePoolOracleIds<T extends { lp0: { oracleId: string }; lp1: { oracleId: string } }>(
  pools: T[]
): T[] {
  const nativeToWrappedOracleId = new Map<string, string>(
    Object.values(addressBookByChainId).map(chainBook => [
      chainBook.native.oracleId,
      chainBook.tokens.WNATIVE.oracleId,
    ])
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
    if (
      breakdown !== undefined &&
      breakdown !== null &&
      typeof breakdown === 'object' &&
      'price' in breakdown
    ) {
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
  // Load cache and update
  await loadFromRedis();
  await sleep(INIT_DELAY);
  await updateAmmPrices();
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
