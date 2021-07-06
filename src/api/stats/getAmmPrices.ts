`use strict`;

import { fetchAmmPrices } from '../../utils/fetchAmmPrices';

import getNonAmmPrices from './getNonAmmPrices';
import bakeryPools from '../../data/bakeryLpPools.json';
import blizzardLpPools from '../../data/degens/blizzardLpPools.json';
import alpacaLpPools from '../../data/alpacaLpPools.json';
import cafePools from '../../data/cafeLpPools.json';
import cakeLpPools from '../../data/cakeLpPools.json';
import cakeLpV1Pools from '../../data/cakeLpV1Pools.json';
import kebabPools from '../../data/kebabLpPools.json';
import bdollarSbdoPools from '../../data/bdollarSbdoLpPools.json';
import boltBtdPools from '../../data/boltBtdLpPools.json';
import boltBtsPools from '../../data/boltBtsLpPools.json';
import mdexPools from '../../data/heco/mdexLpPools.json';
import monsterPools from '../../data/monsterLpPools.json';
import narPools from '../../data/narLpPools.json';
import nyacashPools from '../../data/nyacashLpPools.json';
import ramenPools from '../../data/ramenLpPools.json';
import thugsPools from '../../data/thugsLpPools.json';
import spongePools from '../../data/spongeLpPools.json';
import crowPools from '../../data/crowLpPools.json';
import inchPools from '../../data/1inchLpPools.json';
import saltPools from '../../data/degens/saltLpPools.json';
import apePools from '../../data/degens/apeLpPools.json';
import soupPools from '../../data/degens/soupLpPools.json';
import autoPools from '../../data/autoLpPools.json';
import julPools from '../../data/julLpPools.json';
import memePools from '../../data/degens/memeFarmLpPools.json';
import nutsPools from '../../data/degens/nutsLpPools.json';
import slimePools from '../../data/degens/slimeLpPools.json';
import pangolinPools from '../../data/avax/pangolinLpPools.json';
import swipePools from '../../data/swipeLpPools.json';
import comAvaxPools from '../../data/avax/comAvaxLpPools.json';
import comBscPools from '../../data/comBscLpPools.json';
import snowballPools from '../../data/avax/snobLpPools.json';
import pumpyPools from '../../data/pumpyLpPools.json';
import spacePools from '../../data/degens/spaceLpPools.json';
import nautPools from '../../data/degens/nautLpPools.json';
import ellipsisPools from '../../data/ellipsisLpPools.json';
import hpsPools from '../../data/degens/hpsLpPools.json';
import zefiPools from '../../data/degens/zefiLpPools.json';
import thunderPools from '../../data/degens/thunderLpPools.json';
import swirlPools from '../../data/swirlLpPools.json';
import swampyPools from '../../data/degens/swampyLpPools.json';
import yieldBayPools from '../../data/degens/yieldBayLpPools.json';
import bingoPools from '../../data/degens/bingoLpPools.json';
import olivePools from '../../data/avax/oliveLpPools.json';
import bitiPools from '../../data/degens/bitiLpPools.json';
import mdexBscPools from '../../data/mdexBscLpPools.json';
import typhPools from '../../data/typhLpPools.json';
import typhPoolsV1 from '../../data/typhLpPoolsV1.json';
import marshPools from '../../data/degens/marshLpPools.json';
import lavaPools from '../../data/heco/lavaLpPools.json';
import popsiclePools from '../../data/popsicleLpPools.json';
import comethPools from '../../data/matic/comethLpPools.json';
import hfiPools from '../../data/heco/hfiLpPools.json';
import lydPools from '../../data/avax/lydLpPools.json';
import icarusPools from '../../data/icarusLpPools.json';
import quickPools from '../../data/matic/quickLpPools.json';
import krillPools from '../../data/matic/krillLpPools.json';
import sushiLpPools from '../../data/matic/sushiLpPools.json';
import satisPools from '../../data/degens/satisLpPools.json';
import satisXPools from '../../data/degens/satisXLpPools.json';
import zefiV2Pools from '../../data/degens/zefiLpPoolsV2.json';
import spookyPools from '../../data/fantom/spookyLpPools.json';
import froyoPools from '../../data/fantom/froyoLpPools.json';
import esterPools from '../../data/fantom/esterLpPools.json';
import comethMultiPools from '../../data/matic/comethMultiLpPools.json';
import goalPools from '../../data/degens/goalLpPools.json';
import tofyPools from '../../data/degens/tofyLpPools.json';
import gondolaPools from '../../data/avax/gondolaLpPools.json';
import dopplePools from '../../data/doppleLpPools.json';
import garudaPools from '../../data/degens/garudaLpPools.json';
import ironPools from '../../data/degens/ironLpPools.json';
import ironDndPools from '../../data/degens/ironDndLpPools.json';
import polyzapPools from '../../data/matic/polyzapLpPools.json';
import jetswapPools from '../../data/jetswapLpPools.json';
import dumplingPools from '../../data/degens/dumplingLpPools.json';
import grandPools from '../../data/grandLpPools.json';
import ironMaticPools from '../../data/matic/ironLpPools.json';
import ironTitanPools from '../../data/matic/ironTitanLpPools.json';
import ironQuickPools from '../../data/matic/ironQuickLpPools.json';
import polycatQuickPool from '../../data/matic/polycatQuickLpPool.json';
import polycatDfynPool from '../../data/matic/polycatDfynLpPool.json';
import polycatSushiPool from '../../data/matic/polycatSushiLpPool.json';
import lendhubPools from '../../data/heco/lendhubLpPools.json';
import pantherPools from '../../data/degens/pantherLpPools.json';
import waultPools from '../../data/waultLpPools.json';
import tenfiPools from '../../data/tenfiLpPools.json';
import burgerPools from '../../data/burgerLpPools.json';
import tombPools from '../../data/fantom/tombLpPools.json';
import spiritPools from '../../data/fantom/spiritPools.json';
import wexPolyPools from '../../data/matic/wexPolyLpPools.json';
import icarusV2Pools from '../../data/icarusV2LpPools.json';
import merlinPools from '../../data/merlinLpPools.json';
import polypupLpPools from '../../data/matic/polypupLpPools.json';
import polyyeldQuickLpPools from '../../data/matic/polyyeldQuickLpPools.json';
import polyyeldSushiLpPools from '../../data/matic/polyyeldSushiLpPools.json';
import polyyeldApeLpPools from '../../data/matic/polyyeldApeLpPools.json';
import apePolyPools from '../../data/matic/apePolyLpPools.json';
import polyQuityPools from '../../data/matic/polyQuityLpPools.json';
import keeper50pools from '../../data/matic/50kLpPools.json';
import dfynPools from '../../data/matic/dfynLpPools.json';
import boneswapQuickPools from '../../data/matic/boneswapQuickLpPools.json';
import boneswapSushiPools from '../../data/matic/boneswapSushiLpPools.json';
import boneswapApePools from '../../data/matic/boneswapApeLpPools.json';

const INIT_DELAY = 0 * 60 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = [
  ...boneswapApePools,
  ...boneswapSushiPools,
  ...boneswapQuickPools,
  ...polycatDfynPool,
  ...dfynPools,
  ...keeper50pools,
  ...polyQuityPools,
  ...polypupLpPools,
  ...apePolyPools,
  ...polyyeldApeLpPools,
  ...polyyeldQuickLpPools,
  ...polyyeldSushiLpPools,
  ...merlinPools,
  ...icarusV2Pools,
  ...spiritPools,
  ...wexPolyPools,
  ...tombPools,
  ...burgerPools,
  ...waultPools,
  ...tenfiPools,
  ...pantherPools,
  ...lendhubPools,
  ...polycatSushiPool,
  ...polycatQuickPool,
  ...ironQuickPools,
  ...ironTitanPools,
  ...ironMaticPools,
  ...grandPools,
  ...dumplingPools,
  ...jetswapPools,
  ...polyzapPools,
  ...ironDndPools,
  ...ironPools,
  ...garudaPools,
  ...dopplePools,
  ...gondolaPools,
  ...tofyPools,
  ...goalPools,
  ...comethMultiPools,
  ...esterPools,
  ...froyoPools,
  ...spookyPools,
  ...zefiV2Pools,
  ...satisXPools,
  ...satisPools,
  ...krillPools,
  ...sushiLpPools,
  ...quickPools,
  ...lydPools,
  ...icarusPools,
  ...hfiPools,
  ...comethPools,
  ...popsiclePools,
  ...lavaPools,
  ...marshPools,
  ...typhPools,
  ...typhPoolsV1,
  ...mdexBscPools,
  ...bitiPools,
  ...olivePools,
  ...bingoPools,
  ...yieldBayPools,
  ...swampyPools,
  ...swirlPools,
  ...thunderPools,
  ...zefiPools,
  ...hpsPools,
  ...ellipsisPools,
  ...nautPools,
  ...spacePools,
  ...pumpyPools,
  ...snowballPools,
  ...comBscPools,
  ...comAvaxPools,
  ...pangolinPools,
  ...swipePools,
  ...slimePools,
  ...blizzardLpPools,
  ...nutsPools,
  ...memePools,
  ...julPools,
  ...autoPools,
  ...alpacaLpPools,
  ...soupPools,
  ...apePools,
  ...saltPools,
  ...inchPools,
  ...crowPools,
  ...ramenPools,
  ...cafePools,
  ...bdollarSbdoPools,
  ...spongePools,
  ...bakeryPools,
  ...kebabPools,
  ...boltBtdPools,
  ...boltBtsPools,
  ...mdexPools,
  ...monsterPools,
  ...narPools,
  ...nyacashPools,
  ...thugsPools,
  ...cakeLpV1Pools,
  ...cakeLpPools,
];

const knownPrices = {
  BUSD: 1,
  USDT: 1,
  HUSD: 1,
  DAI: 1,
  USDC: 1,
  UST: 1,
};

let tokenPricesCache: Promise<any>;
let lpPricesCache: Promise<any>;

const updateAmmPrices = async () => {
  console.log('> updating amm prices');
  try {
    const ammPrices = fetchAmmPrices(pools, knownPrices);

    const tokenPrices = ammPrices.then(({ _, tokenPrices }) => tokenPrices);

    const lpPrices = ammPrices.then(async ({ poolPrices, tokenPrices }) => {
      const nonAmmPrices = await getNonAmmPrices(tokenPrices);
      return { ...poolPrices, ...nonAmmPrices };
    });

    await tokenPrices;
    await lpPrices;

    tokenPricesCache = tokenPrices;
    lpPricesCache = lpPrices;

    return {
      tokenPrices,
      lpPrices,
    };
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(updateAmmPrices, REFRESH_INTERVAL);
    console.log('> updated amm prices');
  }
};

export const getAmmTokensPrices = async () => {
  return await tokenPricesCache;
};

export const getAmmLpPrices = async () => {
  return await lpPricesCache;
};

export const getAmmTokenPrice = async tokenSymbol => {
  const tokenPrices = await getAmmTokensPrices();
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    return tokenPrices[tokenSymbol];
  }
  console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
};

export const getAmmLpPrice = async lpName => {
  const lpPrices = await getAmmLpPrices();
  if (lpPrices.hasOwnProperty(lpName)) {
    return lpPrices[lpName];
  }
  console.error(`Unknown liqudity pair '${lpName}'. Consider adding it to .json file`);
};

const init =
  // Flexible delayed initialization used to work around ratelimits
  new Promise((resolve, reject) => {
    setTimeout(resolve, INIT_DELAY);
  }).then(updateAmmPrices);

tokenPricesCache = init.then(({ tokenPrices, lpPrices }) => tokenPrices);
lpPricesCache = init.then(({ tokenPrices, lpPrices }) => lpPrices);
