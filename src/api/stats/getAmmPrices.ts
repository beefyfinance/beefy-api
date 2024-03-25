`use strict`;

import { fetchAmmPrices } from '../../utils/fetchAmmPrices';
import { fetchDmmPrices } from '../../utils/fetchDmmPrices';
import { fetchMooPrices } from '../../utils/fetchMooPrices';
import { fetchXPrices } from '../../utils/fetchXPrices';
import { fetchOptionTokenPrices } from '../../utils/fetchOptionTokenPrices';
import { fetchWrappedAavePrices } from '../../utils/fetchWrappedAaveTokenPrices';
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
import apeJunglePools from '../../data/degens/apeJungleLpPools.json';
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
import popsiclePools from '../../data/popsicleLpPools.json';
import comethPools from '../../data/matic/comethLpPools.json';
import lydPools from '../../data/avax/lydLpPools.json';
import icarusPools from '../../data/icarusLpPools.json';
import quickPools from '../../data/matic/quickLpPools.json';
import krillPools from '../../data/matic/krillLpPools.json';
import sushiLpPools from '../../data/matic/sushiLpPools.json';
import sushiOhmPools from '../../data/matic/sushiOhmLpPools.json';
import satisPools from '../../data/degens/satisLpPools.json';
import satisXPools from '../../data/degens/satisXLpPools.json';
import zefiV2Pools from '../../data/degens/zefiLpPoolsV2.json';
import froyoPools from '../../data/fantom/froyoLpPools.json';
import esterPools from '../../data/fantom/esterLpPools.json';
import comethMultiPools from '../../data/matic/comethMultiLpPools.json';
import goalPools from '../../data/degens/goalLpPools.json';
import tofyPools from '../../data/degens/tofyLpPools.json';
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
import beamswapMultiRewardLpPools from '../../data/moonbeam/beamswapMultiRewardLpPools.json';
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
import spookyV3LpPools from '../../data/fantom/spookyV3LpPools.json';
import valasLpPools from '../../data/valasLpPools.json';
import bombLpPools from '../../data/degens/bombLpPools.json';
import ripaeLpPools from '../../data/degens/ripaeLpPools.json';
import valleySwapLpPools from '../../data/emerald/valleySwapLpPools.json';
import yuzuLpPools from '../../data/emerald/yuzuLpPools.json';
import yuzuDualPools from '../../data/emerald/yuzuDualLpPools.json';
import dfxPools from '../../data/matic/dfxLpPools.json';
import ripaeMaticPools from '../../data/matic/ripaeLpPools.json';
import velodromePools from '../../data/optimism/velodromeLpPools.json';
import oldVelodromePools from '../../data/optimism/oldVelodromeLpPools.json';
import giddyLpPools from '../../data/matic/giddyLpPools.json';
import ripaeCronosPools from '../../data/cronos/ripaeLpPools.json';
import dystopiaPools from '../../data/matic/dystopiaLpPools.json';
import swapsiclePools from '../../data/avax/siclePools.json';
import ripaeArbitrumPools from '../../data/arbitrum/ripaeLpPools.json';
import radiantPools from '../../data/arbitrum/radiantLpPools.json';
import conePools from '../../data/coneLpPools.json';
import spiritV2Pools from '../../data/fantom/spiritVolatileLpPools.json';
import hermesPools from '../../data/metis/hermesLpPools.json';
import swapFishPools from '../../data/arbitrum/swapFishLpPools.json';
import equalizerPools from '../../data/fantom/equalizerLpPools.json';
import equalizerV2Pools from '../../data/fantom/equalizerV2LpPools.json';
import swapFishBscPools from '../../data/swapFishLpPools.json';
import thenaPools from '../../data/degens/thenaLpPools.json';
import sushiMainnetPools from '../../data/ethereum/sushiLpPools.json';
import synapseLpPools from '../../data/ethereum/synapseLpPools.json';
import solidlyLpPools from '../../data/ethereum/solidlyLpPools.json';
import cantoLpPools from '../../data/canto/cantoLpPools.json';
import solidLizardPools from '../../data/arbitrum/solidlizardLpPools.json';
import velocimeterPools from '../../data/canto/velocimeterLpPools.json';
import velocimeterV2Pools from '../../data/canto/velocimeterV2LpPools.json';
import equilibrePools from '../../data/kava/equilibreLpPools.json';
import versePools from '../../data/ethereum/verseLpPools.json';
import ramsesPools from '../../data/arbitrum/ramsesLpPools.json';
import chronosPools from '../../data/arbitrum/chronosLpPools.json';
import arbidexPools from '../../data/arbitrum/arbidexLpPools.json';
import pearlPools from '../../data/matic/pearlLpPools.json';
import velocorePools from '../../data/zksync/velocoreLpPools.json';
import soliSnekPools from '../../data/avax/soliSnekLpPools.json';
import veSyncPools from '../../data/zksync/veSyncLpPools.json';
import fvmPools from '../../data/fantom/fvmLpPools.json';
import bvmPools from '../../data/base/bvmLpPools.json';
import cvmPools from '../../data/canto/cvmLpPools.json';
import baseSwapPools from '../../data/base/baseSwapLpPools.json';
import ooeV2Pools from '../../data/bsc/ooeV2LpPools.json';
import draculaPools from '../../data/zksync/draculaLpPools.json';
import aerodromePools from '../../data/base/aerodromeLpPools.json';
import alienBasePools from '../../data/base/alienBaseLpPools.json';
import swapBasedPools from '../../data/base/swapBasedLpPools.json';
import basoPools from '../../data/base/basoLpPools.json';
import equalizerBasePools from '../../data/base/equalizerLpPools.json';
import moePools from '../../data/mantle/moeLpPools.json';
import lynexPools from '../../data/linea/lynexVolatilePools.json';
import { fetchVaultPrices } from '../../utils/fetchVaultPrices';
import { addressBookByChainId } from '../../../packages/address-book/address-book';
import { sleep } from '../../utils/time';
import { isFiniteNumber } from '../../utils/number';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { fetchChainLinkPrices } from '../../utils/fetchChainLinkPrices';
import { fetchVenusPrices } from './bsc/venus/getVenusPrices';
import { getLpBasedPrices } from './getLpBasedPrices';
import uniswapLpPools from '../../data/ethereum/uniswapV2LpPools.json';

const INIT_DELAY = 2 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = normalizePoolOracleIds([
  ...moePools,
  ...equalizerBasePools,
  ...lynexPools,
  ...basoPools,
  ...swapBasedPools,
  ...alienBasePools,
  ...aerodromePools,
  ...draculaPools,
  ...ooeV2Pools,
  ...baseSwapPools,
  ...fvmPools,
  ...bvmPools,
  ...cvmPools,
  ...veSyncPools,
  ...soliSnekPools,
  ...velocorePools,
  ...pearlPools,
  ...arbidexPools,
  ...chronosPools,
  ...ramsesPools,
  ...versePools,
  ...equilibrePools,
  ...velocimeterV2Pools,
  ...velocimeterPools,
  ...solidLizardPools,
  ...cantoLpPools,
  ...solidlyLpPools,
  ...synapseLpPools,
  ...sushiMainnetPools,
  ...thenaPools,
  ...swapFishBscPools,
  ...equalizerV2Pools,
  ...equalizerPools,
  ...swapFishPools,
  ...hermesPools,
  ...spiritV2Pools,
  ...conePools,
  ...radiantPools,
  ...ripaeArbitrumPools,
  ...swapsiclePools,
  ...ripaeCronosPools,
  ...dystopiaPools,
  ...velodromePools,
  ...oldVelodromePools,
  // ...valleySwapLpPools,
  ...dfxPools,
  //...yuzuDualPools,
  //...yuzuLpPools,
  ...ripaeLpPools,
  ...bombLpPools,
  ...valasLpPools,
  ...spookyV2LpPools,
  ...spookyV3LpPools,
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
  ...beamswapMultiRewardLpPools,
  ...beamswapPools,
  ...finnLpPools,
  ...bisonPools,
  ...maiAvaxLpPools,
  ...trisolarisLpPools,
  ...solarbeamDualLpPools,
  ...cronaPools,
  ...vvsPools,
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
  ...tofyPools,
  ...goalPools,
  ...comethMultiPools,
  ...esterPools,
  ...froyoPools,
  ...zefiV2Pools,
  ...satisXPools,
  ...satisPools,
  ...krillPools,
  ...sushiLpPools,
  ...sushiOhmPools,
  ...quickPools,
  ...lydPools,
  ...icarusPools,
  ...comethPools,
  ...popsiclePools,
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
  ...apeJunglePools,
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
  ...monsterPools,
  ...narPools,
  ...nyacashPools,
  ...thugsPools,
  ...cakeLpPoolsV2,
  ...cakeLpV1Pools,
  ...cakeLpPools,
  ...giddyLpPools,
  ...uniswapLpPools,
]);

const dmmPools = [...kyberPools, ...oldDmmPools];

const currencies = ['cad'];

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
  'jarvis-synthetic-euro': ['jEUR'],
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
  betswirl: ['BETS'],
  'ankr-reward-bearing-ftm': ['ankrFTM'],
  lucha: ['LUCHA'],
  'cow-protocol': ['COW'],
  'electronic-usd': ['eUSD'],
  'mendi-finance': ['MENDI'],
  'overnight-finance': ['OVN'],
  'gyroscope-gyd': ['GYD'],
  'renzo-restaked-eth': ['ezETH'],
  'qi-dao': ['QIv2'],
  'verified-usd-foundation-usdv': ['USDV'],
  'stake-dao-crv': ['sdCRV'],
  'kelp-dao-restaked-eth': ['rsETH'],
};

/**
 * Can use any oracleId set from chainlink or coingecko here
 * Runs after chainlink/coingecko prices are fetched but before any other price sources
 * Add here only as last resort if no other AMM price source is available
 * @see fetchSeedPrices
 */
const seedPeggedPrices = {
  WETH: 'ETH', // Wrapped native
  WBTC: 'BTC', // Wrapped native
  WMATIC: 'MATIC', // Wrapped native
  WAVAX: 'AVAX', // Wrapped native
  WBNB: 'BNB', // Wrapped native
  WFTM: 'FTM', // Wrapped native
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
  alETH: 'ETH', // Alchemix
  hETH: 'ETH', // HOP
  hDAI: 'DAI', // HOP
  hUSDC: 'USDC', // HOP
  hUSDT: 'USDT', // HOP
  aWMATIC: 'MATIC', // Aave
  aWETH: 'ETH', // Aave,
  cArbUSDCv3: 'USDC', // Compound
};

export type LpBreakdown = {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
};
type PricesById = Record<string, number>;
type BreakdownsById = Record<string, LpBreakdown>;

const cachedTokenPrices: PricesById = {};
const cachedLpPrices: PricesById = {};
const cachedAllPrices: PricesById = {};
const cachedLpBreakdowns: BreakdownsById = {};

async function fetchSeedPrices() {
  // ChainLink gives: ETH, BTC, MATIC, AVAX, BNB, LINK, USDT, DAI, USDC
  const seedPrices: Record<string, number> = await fetchChainLinkPrices();

  const coinGeckoPrices = await fetchCoinGeckoPrices(Object.keys(coinGeckoCoins));
  const defillamaPrices = await fetchDefillamaPrices(Object.keys(coinGeckoCoins));
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

  for (const [oracle, peggedOracle] of Object.entries(seedPeggedPrices)) {
    if (peggedOracle in seedPrices) {
      seedPrices[oracle] = seedPrices[peggedOracle];
    } else {
      console.error(`Pegged oracle ${peggedOracle} not found for ${oracle}`);
    }
  }

  return seedPrices;
}

async function performUpdateAmmPrices() {
  // Seed with chain link + coin gecko prices
  const knownPrices = await fetchSeedPrices();

  const ammPrices = fetchAmmPrices(pools, knownPrices).then(prices => {
    //Set prices for the wrapped version of native tokens (if native was set)
    const nativeTokens = new Set(
      Object.values(addressBookByChainId).map(addressbook =>
        addressbook.tokens.WNATIVE.oracleId.slice(1)
      )
    );
    nativeTokens.forEach(nativeToken => {
      if (prices.tokenPrices.hasOwnProperty(nativeToken))
        prices.tokenPrices[`W${nativeToken}`] = prices.tokenPrices[nativeToken];
    });
    return prices;
  });

  const venusPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await fetchVenusPrices(tokenPrices);
  });

  const curveTokenPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await fetchCurveTokenPrices(tokenPrices);
  });

  const solidlyStableTokenPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await fetchSolidlyStableTokenPrices(tokenPrices);
  });

  const dmmPrices = fetchDmmPrices(dmmPools, knownPrices);

  const xPrices = ammPrices.then(async ({ tokenPrices }) => {
    return await fetchXPrices(tokenPrices);
  });

  const mooPrices = ammPrices.then(async ({ poolPrices, tokenPrices }) => {
    return await fetchMooPrices(mooTokens, tokenPrices, poolPrices);
  });

  const optionPrices = ammPrices.then(async ({ tokenPrices }) => {
    const concLiqPrices = await fetchConcentratedLiquidityTokenPrices(tokenPrices);
    const prices = { ...tokenPrices, ...concLiqPrices };
    const optionPrices = await fetchOptionTokenPrices(prices);
    return {
      ...optionPrices,
      ...concLiqPrices,
    };
  });

  const linearPoolPrice = ammPrices.then(
    async ({ tokenPrices }): Promise<Record<string, number>> => {
      const jbrlTokenPrice = await fetchJbrlPrice();
      const yVaultPrices = await fetchyVaultPrices(tokenPrices);
      const vaultPrices = await fetchVaultPrices(tokenPrices);
      const wrappedAavePrices = await fetchWrappedAavePrices(tokenPrices);
      const prices = {
        ...tokenPrices,
        ...vaultPrices,
        ...wrappedAavePrices,
        ...jbrlTokenPrice,
        ...yVaultPrices,
      };

      const linearPrices = await fetchBalancerLinearPoolPrice(prices);
      const balancerStablePoolPrice = await fetchBalancerStablePoolPrice(linearPrices);

      return {
        ...linearPrices,
        ...balancerStablePoolPrice,
        ...wrappedAavePrices,
        ...jbrlTokenPrice,
        ...yVaultPrices,
      };
    }
  );

  const beTokenPrice = ammPrices.then(async ({ tokenPrices }) => {
    return {
      beJOE: tokenPrices['JOE'],
      beQI: tokenPrices['QI'],
      beCAKE: tokenPrices['Cake'],
      beVelo: tokenPrices['BeVELO'],
    };
  });

  const tokenPrices = ammPrices.then(async ({ tokenPrices }) => {
    const dmm = await dmmPrices;
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
      ...dmm.tokenPrices,
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
    const dmm = await dmmPrices;
    const nonAmmPrices = await getNonAmmPrices(await tokenPrices);
    const pendlePrices = await getLpBasedPrices(await tokenPrices, poolPrices, nonAmmPrices);

    return {
      prices: { ...poolPrices, ...dmm.poolPrices, ...nonAmmPrices.prices, ...pendlePrices.prices },
      breakdown: {
        ...lpsBreakdown,
        ...dmm.lpsBreakdown,
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
      tokenPricesPromise,
      lpPricesPromise,
      lpBreakdownPromise,
    ]);

    if (addToCache(tokenPrices, lpPrices, lpBreakdowns)) {
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

// We want to treat wrapped tokens the same way we'd treat normal ones => We then swap all wrapped token oracleIds to their underlying
function normalizePoolOracleIds(pools) {
  const wrappedNativeTokens = new Set(
    Object.values(addressBookByChainId).map(addressbook => addressbook.tokens.WNATIVE.oracleId)
  );

  pools.forEach(pool => {
    const fields = ['lp0', 'lp1'];
    fields.forEach(token => {
      if (wrappedNativeTokens.has(pool[token].oracleId)) {
        pool[token].oracleId = pool[token].oracleId.slice(1);
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

function addToCache(
  tokenPrices: PricesById,
  lpPrices: PricesById,
  lpBreakdowns: BreakdownsById
): boolean {
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

async function saveToRedis() {
  await setKey('TOKEN_PRICES', cachedTokenPrices);
  await setKey('LP_PRICES', cachedLpPrices);
  await setKey('LP_BREAKDOWN', cachedLpBreakdowns);
}
