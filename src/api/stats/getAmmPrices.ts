`use strict`;

import { fetchAmmPrices } from '../../utils/fetchAmmPrices';
import { fetchDmmPrices } from '../../utils/fetchDmmPrices';
import { fetchMooPrices } from '../../utils/fetchMooPrices';
import { fetchXPrices } from '../../utils/fetchXPrices';
import { fetchStargatePrices } from '../../utils/fetchStargatePrices';
import { fetchbeFTMPrice } from '../../utils/fetchbeFTMPrice';
import { fetchCoinGeckoPrices } from '../../utils/fetchCoinGeckoPrices';
import { getKey, setKey } from '../../utils/redisHelper';

import getNonAmmPrices from './getNonAmmPrices';
import bakeryPools from '../../data/bakeryLpPools.json';
import blizzardLpPools from '../../data/degens/blizzardLpPools.json';
import alpacaLpPools from '../../data/alpacaLpPools.json';
import cafePools from '../../data/cafeLpPools.json';
import cakeLpPools from '../../data/cakeLpPools.json';
import cakeLpV1Pools from '../../data/cakeLpV1Pools.json';
import cakeLpPoolsV2 from '../../data/cakeLpPoolsV2.json';
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
import sushiOhmPools from '../../data/matic/sushiOhmLpPools.json';
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
import polypupBallLpPools from '../../data/matic/polypupBallLpPools.json';
import polyyeldQuickLpPools from '../../data/matic/polyyeldQuickLpPools.json';
import polyyeldSushiLpPools from '../../data/matic/polyyeldSushiLpPools.json';
import polyyeldApeLpPools from '../../data/matic/polyyeldApeLpPools.json';
import polyyeldL2LpPools from '../../data/matic/polyyeldL2LpPools.json';
import apePolyPools from '../../data/matic/apePolyLpPools.json';
import polyQuityPools from '../../data/matic/polyQuityLpPools.json';
import keeper50pools from '../../data/matic/50kLpPools.json';
import dfynPools from '../../data/matic/dfynLpPools.json';
import boneswapQuickPools from '../../data/matic/boneswapQuickLpPools.json';
import boneswapSushiPools from '../../data/matic/boneswapSushiLpPools.json';
import boneswapApePools from '../../data/matic/boneswapApeLpPools.json';
import maiPools from '../../data/matic/maiLpPools.json';
import jetswapPolyPools from '../../data/matic/jetswapLpPools.json';
import farmheroPolygonPools from '../../data/matic/farmheroPools.json';
import farmheroBscPools from '../../data/farmheroPools.json';
import ironSwapPools from '../../data/matic/ironSwapLpPools.json';
import ooePools from '../../data/ooeLpPools.json';
import telxchangePools from '../../data/matic/telxchangePools.json';
import kingdefiPools from '../../data/degens/kingdefiLpPools.json';
import rabbitPools from '../../data/degens/rabbitLpPools.json';
import dinoPools from '../../data/matic/dinoswapLpPools.json';
import fruitPools from '../../data/degens/fruitLpPools.json';
import pswampPools from '../../data/matic/swampLpPools.json';
import polyCrackerPools from '../../data/matic/polyCrackerLpPools.json';
import peraPools from '../../data/degens/peraLpPools.json';
import sushiOnePools from '../../data/one/sushiLpPools.json';
import stablequantPools from '../../data/degens/stablequantLpPools.json';
import honeyPools from '../../data/degens/honeyFarmLpPools.json';
import steakhouseLpPools from '../../data/fantom/steakhouseLpPools.json';
import stakesteakLpPools from '../../data/fantom/stakesteakLpPools.json';
import polygonFarmPools from '../../data/matic/polygonFarmLpPools.json';
import pearzapPools from '../../data/matic/pearzapLpPools.json';
import tosdisPools from '../../data/degens/tosdisLpPools.json';
import yelPools from '../../data/degens/yelLpPools.json';
import omnifarmPools from '../../data/degens/omnifarmLpPools.json';
import viralataLpPools from '../../data/degens/viralataLpPools.json';
import joePools from '../../data/avax/joeLpPools.json';
import joeDualLpPools from '../../data/avax/joeDualLpPools.json';
import elkPools from '../../data/degens/elkLpPools.json';
import longPools from '../../data/degens/longLpPools.json';
import CZFPools from '../../data/degens/CZFLpPools.json';
import sushiArbPools from '../../data/arbitrum/sushiLpPools.json';
import arbiNyanPools from '../../data/arbitrum/arbiNyanLpPools.json';
import pearzapBscPools from '../../data/degens/pearzapLpPools.json';
import sandmanPools from '../../data/matic/sandmanLpPools.json';
import sushiMimPools from '../../data/arbitrum/sushiLpMimPools.json';
import polyalphaPools from '../../data/matic/polyalphaLpPools.json';
import annexPools from '../../data/degens/annexLpPools.json';
import polywisePools from '../../data/matic/polywiseLpPools.json';
import polySagePools from '../../data/matic/polysageLpPools.json';
import pacocaPools from '../../data/degens/pacocaLpPools.json';
import jetswapFantomPools from '../../data/fantom/jetswapLpPools.json';
import tetuPools from '../../data/matic/tetuLpPools.json';
import geistPools from '../../data/fantom/geistLpPools.json';
import singularPolyPools from '../../data/matic/singularLpPools.json';
import singularBscPools from '../../data/degens/singularLpPools.json';
import singularAvaxPools from '../../data/avax/singularLpPools.json';
import singularFantomPools from '../../data/fantom/singularLpPools.json';
import cafeBscPools from '../../data/degens/cafeLpPools.json';
import cafePolyPools from '../../data/matic/cafeLpPools.json';
import oldPools from '../../data/archive/oldLpPools.json';
import kyberPools from '../../data/matic/kyberLpPools.json';
import babyPools from '../../data/degens/babyLpPools.json';
import quickDualLpPools from '../../data/matic/quickDualLpPools.json';
import pearzapFantomPools from '../../data/fantom/pearzapLpPools.json';
import sushiCeloPools from '../../data/celo/sushiLpPools.json';
import mooTokens from '../../data/mooTokens.json';
import wsgPools from '../../data/degens/wsgLpPools.json';
import summitPools from '../../data/fantom/summitLpPools.json';
import solarbeamPools from '../../data/moonriver/solarbeamLpPools.json';
import sushiMr from '../../data/moonriver/sushiLp.json';
import sushiMrPools from '../../data/moonriver/sushiLpPools.json';
import blizzPools from '../../data/avax/blizzLpPools.json';
import vvsPools from '../../data/cronos/vvsLpPools.json';
import cronaPools from '../../data/cronos/cronaLpPools.json';
import solarbeamDualLpPools from '../../data/moonriver/solarbeamDualLpPools.json';
import trisolarisLpPools from '../../data/aurora/trisolarisLpPools.json';
import maiAvaxLpPools from '../../data/avax/maiLpPools.json';
import bisonPools from '../../data/degens/bisonLpPools.json';
import finnLpPools from '../../data/moonriver/finnLpPools.json';
import blockMinePools from '../../data/degens/blockMineLpPools.json';
import biswapPools from '../../data/biswapLpPools.json';
import chargePools from '../../data/degens/chargeLpPools.json';
import charmPools from '../../data/fantom/charmLpPools.json';
import solarbeamDualLpV2Pools from '../../data/moonriver/solarbeamDualLpV2Pools.json';
import liquidusPools from '../../data/cronos/liquidusLpPools.json';
import sushiv2Celo from '../../data/celo/sushiv2LpPools.json';
import oldDmmPools from '../../data/archive/oldDmmPools.json';
import popsicleFantomPools from '../../data/fantom/popsicleLpPools.json';
import fusefiPools from '../../data/fuse/fusefiLpPools.json';
import netswapPools from '../../data/metis/netswapLpPools.json';
import dibsLpPools from '../../data/degens/dibsLpPools.json';
import pangolinV2Pools from '../../data/avax/pangolinv2LpPools.json';
import pangolinV2DualPools from '../../data/avax/pangolinV2DualLpPools.json';
import t2ombLpPools from '../../data/fantom/2ombLpPools.json';
import tethysPools from '../../data/metis/tethysLpPools.json';
import popsicleMaticPools from '../../data/matic/popsicleLpPools.json';
import oxdaoPools from '../../data/fantom/0xdaoPools.json';
import sushiFtmPools from '../../data/fantom/sushiFtmLpPools.json';
import sushiFusePools from '../../data/fuse/sushiFuseLpPools.json';
import grapePools from '../../data/avax/grapeLpPools.json';
import trisolarisMiniPools from '../../data/aurora/trisolarisMiniLpPools.json';
import creditumPools from '../../data/fantom/creditumPools.json';
import ripaePools from '../../data/fantom/ripaeLpPools.json';
import ripaeAvaxPools from '../../data/avax/ripaeLpPools.json';
import beamswapPools from '../../data/moonbeam/beamswapLpPools.json';
import stellaswapPools from '../../data/moonbeam/stellaswapLpPools.json';
import stellaswapPoolsV2 from '../../data/moonbeam/stellaswapLpV2Pools.json';
import darkCryptoPools from '../../data/cronos/darkCryptoLpPools.json';
import wigoPools from '../../data/fantom/wigoLpPools.json';
import solidlyPools from '../../data/fantom/solidlyLpPools.json';
import solarflare from '../../data/moonbeam/solarFlareLpPools.json';
import basedPools from '../../data/fantom/basedLpPools.json';
import voltagePools from '../../data/fuse/voltageLpPools.json';
import bombSwapPools from '../../data/fantom/bombSwapPools.json';
import empLpPools from '../../data/degens/empLpPools.json';
import vvsDualPools from '../../data/cronos/vvsDualLpPools.json';
import joeBoostedLpPools from '../../data/avax/joeBoostedLpPools.json';
import spookyV2LpPools from '../../data/fantom/spookyV2LpPools.json';
import valasLpPools from '../../data/valasLpPools.json';
import bombLpPools from '../../data/degens/bombLpPools.json';
import pegasysLpPools from '../../data/sys/pegasysLpPools.json';
import ripaeLpPools from '../../data/degens/ripaeLpPools.json';
import valleySwapLpPools from '../../data/emerald/valleySwapLpPools.json';
import yuzuLpPools from '../../data/emerald/yuzuLpPools.json';
import yuzuDualPools from '../../data/emerald/yuzuDualLpPools.json';
import dfxPools from '../../data/matic/dfxLpPools.json';
import ripaeMaticPools from '../../data/matic/ripaeLpPools.json';
import velodromePools from '../../data/optimism/velodromeLpPools.json';

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = [
  ...velodromePools,
  ...valleySwapLpPools,
  ...dfxPools,
  ...yuzuDualPools,
  ...yuzuLpPools,
  ...ripaeLpPools,
  ...pegasysLpPools,
  ...bombLpPools,
  ...valasLpPools,
  ...spookyV2LpPools,
  ...vvsDualPools,
  ...joeBoostedLpPools,
  ...empLpPools,
  ...bombSwapPools,
  ...voltagePools,
  ...basedPools,
  ...stellaswapPools,
  ...stellaswapPoolsV2,
  ...solarflare,
  ...solidlyPools,
  ...wigoPools,
  ...darkCryptoPools,
  ...beamswapPools,
  ...ripaePools,
  ...ripaeAvaxPools,
  ...ripaeMaticPools,
  ...creditumPools,
  ...trisolarisMiniPools,
  ...grapePools,
  ...sushiFusePools,
  ...sushiFtmPools,
  ...oxdaoPools,
  ...tethysPools,
  ...t2ombLpPools,
  ...pangolinV2Pools,
  ...pangolinV2DualPools,
  ...dibsLpPools,
  ...netswapPools,
  ...fusefiPools,
  ...popsicleFantomPools,
  ...popsicleMaticPools,
  ...sushiv2Celo,
  ...liquidusPools,
  ...biswapPools,
  ...solarbeamDualLpV2Pools,
  ...charmPools,
  ...chargePools,
  ...blockMinePools,
  ...oldPools,
  ...finnLpPools,
  ...bisonPools,
  ...maiAvaxLpPools,
  ...trisolarisLpPools,
  ...solarbeamDualLpPools,
  ...cronaPools,
  ...vvsPools,
  ...blizzPools,
  ...sushiMrPools,
  ...sushiMr,
  ...solarbeamPools,
  ...summitPools,
  ...wsgPools,
  ...pearzapFantomPools,
  ...sushiCeloPools,
  ...quickDualLpPools,
  ...babyPools,
  ...cafePolyPools,
  ...cafeBscPools,
  ...geistPools,
  ...singularPolyPools,
  ...singularBscPools,
  ...singularAvaxPools,
  ...singularFantomPools,
  ...jetswapFantomPools,
  ...tetuPools,
  ...polywisePools,
  ...polySagePools,
  ...pacocaPools,
  ...annexPools,
  ...sushiMimPools,
  ...polyalphaPools,
  ...sandmanPools,
  ...pearzapBscPools,
  ...CZFPools,
  ...arbiNyanPools,
  ...sushiArbPools,
  ...longPools,
  ...elkPools,
  ...viralataLpPools,
  ...joePools,
  ...joeDualLpPools,
  ...omnifarmPools,
  ...tosdisPools,
  ...yelPools,
  ...pearzapPools,
  ...polygonFarmPools,
  ...steakhouseLpPools,
  ...stakesteakLpPools,
  ...honeyPools,
  ...stablequantPools,
  ...sushiOnePools,
  ...peraPools,
  ...polyCrackerPools,
  ...pswampPools,
  ...fruitPools,
  ...dinoPools,
  ...farmheroBscPools,
  ...farmheroPolygonPools,
  ...rabbitPools,
  ...kingdefiPools,
  ...telxchangePools,
  ...ooePools,
  ...ironSwapPools,
  ...jetswapPolyPools,
  ...maiPools,
  ...boneswapApePools,
  ...boneswapSushiPools,
  ...boneswapQuickPools,
  ...polycatDfynPool,
  ...dfynPools,
  ...keeper50pools,
  ...polyQuityPools,
  ...polypupBallLpPools,
  ...polypupLpPools,
  ...apePolyPools,
  ...polyyeldL2LpPools,
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
  ...sushiOhmPools,
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
  ...cakeLpPoolsV2,
  ...cakeLpV1Pools,
  ...cakeLpPools,
];

const dmmPools = [...kyberPools, ...oldDmmPools];

const coinGeckoCoins = [
  'stasis-eurs',
  'tether-eurt',
  'par-stablecoin',
  'jarvis-synthetic-euro',
  'jpyc',
  'cad-coin',
  'xsgd',
  'usd-balance',
  'gelato',
  'optimism',
  'perpetual-protocol',
  'nusd',
  'lyra-finance',
  'liquity-usd',
];

const knownPrices = {
  BUSD: 1,
  USDT: 1,
  HUSD: 1,
  DAI: 1,
  USDC: 1,
  USDN: 1,
  cUSD: 1,
  asUSDC: 1,
};

let tokenPricesCache: Promise<any>;
let lpPricesCache: Promise<any>;
let lpBreakdownCache: Promise<any>;

const updateAmmPrices = async () => {
  console.log('> updating amm prices');
  let start = Date.now();
  try {
    const coinGeckoPrices = async () => {
      const prices = await fetchCoinGeckoPrices(coinGeckoCoins);
      return {
        OP: prices['optimism'],
        EURS: prices['stasis-eurs'],
        EURt: prices['tether-eurt'],
        PAR: prices['par-stablecoin'],
        jEUR: prices['jarvis-synthetic-euro'],
        JPYC: prices['jpyc'],
        CADC: prices['cad-coin'],
        XSGD: prices['xsgd'],
        USDB: prices['usd-balance'],
        GEL: prices['gelato'],
        PERP: prices['perpetual-protocol'],
        sUSD: prices['nusd'],
        LYRA: prices['lyra-finance'],
        LUSD: prices['liquity-usd'],
      };
    };

    const ammPrices = fetchAmmPrices(pools, knownPrices);
    const dmmPrices = fetchDmmPrices(dmmPools, knownPrices);

    const xPrices = ammPrices.then(async ({ poolPrices, tokenPrices, _ }) => {
      return await fetchXPrices(tokenPrices);
    });

    const stargatePrices = ammPrices.then(async ({ poolPrices, tokenPrices, _ }) => {
      return await fetchStargatePrices(tokenPrices);
    });

    const mooPrices = ammPrices.then(async ({ poolPrices, tokenPrices, _ }) => {
      return await fetchMooPrices(mooTokens, tokenPrices, poolPrices);
    });

    const beFtmPrice = ammPrices.then(async ({ poolPrices, tokenPrices, _ }) => {
      return await fetchbeFTMPrice(tokenPrices);
    });

    const beTokenPrice = ammPrices.then(async ({ poolPrices, tokenPrices, _ }) => {
      return {
        beJOE: tokenPrices['JOE'],
        beQI: tokenPrices['QI'],
        beCAKE: tokenPrices['Cake'],
      };
    });

    const tokenPrices = ammPrices.then(async ({ _, tokenPrices, __ }) => {
      const dmm = await dmmPrices;
      const xTokenPrices = await xPrices;
      const mooTokenPrices = await mooPrices;
      const beFtmTokenPrice = await beFtmPrice;
      const stargateTokenPrices = await stargatePrices;
      const beTokenTokenPrice = await beTokenPrice;
      return {
        ...tokenPrices,
        ...dmm.tokenPrices,
        ...mooTokenPrices,
        ...xTokenPrices,
        ...stargateTokenPrices,
        ...beFtmTokenPrice,
        ...beTokenTokenPrice,
        ...(await coinGeckoPrices()),
      };
    });

    const lpData = ammPrices.then(async ({ poolPrices, _, lpsBreakdown }) => {
      const dmm = await dmmPrices;
      const nonAmmPrices = await getNonAmmPrices(await tokenPrices);

      return {
        prices: { ...poolPrices, ...dmm.poolPrices, ...nonAmmPrices.prices },
        breakdown: { ...lpsBreakdown, ...dmm.lpsBreakdown, ...nonAmmPrices.breakdown },
      };
    });

    const lpBreakdown = lpData.then(({ prices, breakdown }) => breakdown);
    const lpPrices = lpData.then(({ prices, breakdown }) => prices);

    await tokenPrices;
    await lpData;

    tokenPricesCache = tokenPrices;
    lpPricesCache = lpPrices;
    lpBreakdownCache = lpBreakdown;

    return {
      tokenPrices,
      lpPrices,
      lpBreakdown,
    };
  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(updateAmmPrices, REFRESH_INTERVAL);
    console.log(`> updated amm prices (${(Date.now() - start) / 1000}s)`);
    saveToRedis();
  }
};

export const getAmmTokensPrices = async () => {
  return await tokenPricesCache;
};

export const getAmmLpPrices = async () => {
  return await lpPricesCache;
};

export const getLpBreakdown = async () => {
  return await lpBreakdownCache;
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
  console.error(`Unknown liquidity pair '${lpName}'. Consider adding it to .json file`);
};

export const initPriceService = async () => {
  const tokenPrices = await getKey('TOKEN_PRICES');
  const lpPrices = await getKey('LP_PRICES');
  const lpBreakdown = await getKey('LP_BREAKDOWN');

  const init =
    // Flexible delayed initialization used to work around ratelimits
    new Promise((resolve, reject) => {
      setTimeout(resolve, INIT_DELAY);
    }).then(updateAmmPrices);

  tokenPricesCache =
    tokenPrices ?? init.then(({ tokenPrices, lpPrices, lpBreakdown }) => tokenPrices);
  lpPricesCache = lpPrices ?? init.then(({ tokenPrices, lpPrices, lpBreakdown }) => lpPrices);
  lpBreakdownCache =
    lpBreakdown ?? init.then(({ tokenPrices, lpPrices, lpBreakdown }) => lpBreakdown);
};

const saveToRedis = async () => {
  await setKey('TOKEN_PRICES', await tokenPricesCache);
  await setKey('LP_PRICES', await lpPricesCache);
  await setKey('LP_BREAKDOWN', await lpBreakdownCache);
  console.log('Prices saved to redis');
};
