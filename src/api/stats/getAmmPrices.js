const { fetchAmmPrices } = require('../../utils/fetchAmmPrices');
const { sleep } = require('../../utils/time');

const getNonAmmPrices = require('./getNonAmmPrices');
const bakeryPools = require('../../data/bakeryLpPools.json');
const blizzardLpPools = require('../../data/degens/blizzardLpPools.json');
const alpacaLpPools = require('../../data/alpacaLpPools.json');
const cafePools = require('../../data/cafeLpPools.json');
const cakeLpPools = require('../../data/cakeLpPools.json');
const cakeLpV1Pools = require('../../data/cakeLpV1Pools.json');
const jetfuelPools = require('../../data/jetfuelLpPools.json');
const kebabPools = require('../../data/kebabLpPools.json');
const bdollarSbdoPools = require('../../data/bdollarSbdoLpPools.json');
const boltBtdPools = require('../../data/boltBtdLpPools.json');
const boltBtsPools = require('../../data/boltBtsLpPools.json');
const mdexPools = require('../../data/heco/mdexLpPools.json');
const monsterPools = require('../../data/monsterLpPools.json');
const narPools = require('../../data/narLpPools.json');
const nyacashPools = require('../../data/nyacashLpPools.json');
const ramenPools = require('../../data/ramenLpPools.json');
const thugsPools = require('../../data/thugsLpPools.json');
const spongePools = require('../../data/spongeLpPools.json');
const crowPools = require('../../data/crowLpPools.json');
const inchPools = require('../../data/1inchLpPools.json');
const saltPools = require('../../data/degens/saltLpPools.json');
const apePools = require('../../data/degens/apeLpPools.json');
const soupPools = require('../../data/degens/soupLpPools.json');
const autoPools = require('../../data/autoLpPools.json');
const julPools = require('../../data/julLpPools.json');
const memePools = require('../../data/degens/memeFarmLpPools.json');
const nutsPools = require('../../data/degens/nutsLpPools.json');
const slimePools = require('../../data/degens/slimeLpPools.json');
const pangolinPools = require('../../data/avax/pangolinLpPools.json');
const swipePools = require('../../data/swipeLpPools.json');
const comAvaxPools = require('../../data/avax/comAvaxLpPools.json');
const comBscPools = require('../../data/comBscLpPools.json');
const snowballPools = require('../../data/avax/snobLpPools.json');
const pumpyPools = require('../../data/pumpyLpPools.json');
const spacePools = require('../../data/degens/spaceLpPools.json');
const nautPools = require('../../data/degens/nautLpPools.json');
const ellipsisPools = require('../../data/ellipsisLpPools.json');
const hpsPools = require('../../data/degens/hpsLpPools.json');
const zefiPools = require('../../data/degens/zefiLpPools.json');
const thunderPools = require('../../data/degens/thunderLpPools.json');
const swirlPools = require('../../data/swirlLpPools.json');
const swampyPools = require('../../data/degens/swampyLpPools.json');
const yieldBayPools = require('../../data/degens/yieldBayLpPools.json');
const bingoPools = require('../../data/degens/bingoLpPools.json');
const olivePools = require('../../data/avax/oliveLpPools.json');
const bitiPools = require('../../data/degens/bitiLpPools.json');
const mdexBscPools = require('../../data/mdexBscLpPools.json');
const typhPools = require('../../data/typhLpPools.json');
const typhPoolsV1 = require('../../data/typhLpPoolsV1.json');
const marshPools = require('../../data/degens/marshLpPools.json');
const lavaPools = require('../../data/heco/lavaLpPools.json');
const popsiclePools = require('../../data/popsicleLpPools.json');
const comethPools = require('../../data/matic/comethLpPools.json');
const hfiPools = require('../../data/heco/hfiLpPools.json');
const lydPools = require('../../data/avax/lydLpPools.json');
const icarusPools = require('../../data/icarusLpPools.json');
const quickPools = require('../../data/matic/quickLpPools.json');
const krillPools = require('../../data/matic/krillLpPools.json');
const sushiLpPools = require('../../data/matic/sushiLpPools.json');
const satisPools = require('../../data/degens/satisLpPools.json');
const satisXPools = require('../../data/degens/satisXLpPools.json');
const zefiV2Pools = require('../../data/degens/zefiLpPoolsV2.json');
const spookyPools = require('../../data/fantom/spookyLpPools.json');
const froyoPools = require('../../data/fantom/froyoLpPools.json');
const esterPools = require('../../data/fantom/esterLpPools.json');
const comethMultiPools = require('../../data/matic/comethMultiLpPools.json');
const goalPools = require('../../data/degens/goalLpPools.json');
const tofyPools = require('../../data/degens/tofyLpPools.json');
const gondolaPools = require('../../data/avax/gondolaLpPools.json');
const dopplePools = require('../../data/doppleLpPools.json');
const garudaPools = require('../../data/degens/garudaLpPools.json');
const ironPools = require('../../data/degens/ironLpPools.json');
const ironDndPools = require('../../data/degens/ironDndLpPools.json');
const polyzapPools = require('../../data/matic/polyzapLpPools.json');
const jetswapPools = require('../../data/jetswapLpPools.json');
const dumplingPools = require('../../data/degens/dumplingLpPools.json');
const grandPools = require('../../data/grandLpPools.json');
const ironMaticPools = require('../../data/matic/ironLpPools.json');
const ironTitanPools = require('../../data/matic/ironTitanLpPools.json');
const ironQuickPools = require('../../data/matic/ironQuickLpPools.json');
const polycatQuickPool = require('../../data/matic/polycatQuickLpPool.json');
const polycatSushiPool = require('../../data/matic/polycatSushiLpPool.json');
const lendhubPools = require('../../data/heco/lendhubLpPools.json');
const pantherPools = require('../../data/degens/pantherLpPools.json');
const waultPools = require('../../data/waultLpPools.json');

const INIT_DELAY = 0 * 60 * 1000;
const REFRESH_INTERVAL = 5 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = [
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
  ...jetfuelPools,
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
  ...waultPools,
];

const knownPrices = {
  BUSD: 1,
  USDT: 1,
  HUSD: 1,
  DAI: 1,
  USDC: 1,
  UST: 1,
};

let tokenPricesCache = {};
let lpPricesCache = {};
let isProcessing = true;

const updateAmmPrices = async () => {
  console.log('> updating amm prices');
  isProcessing = true;
  try {
    let { poolPrices, tokenPrices } = await fetchAmmPrices(pools, knownPrices);
    const nonAmmPrices = await getNonAmmPrices(tokenPrices);
    tokenPricesCache = tokenPrices;
    lpPricesCache = { ...poolPrices, ...nonAmmPrices };
  } catch (err) {
    console.error(err);
  }
  isProcessing = false;

  setTimeout(updateAmmPrices, REFRESH_INTERVAL);
  console.log('> updated amm prices');
};

const getAmmTokensPrices = async () => {
  // TODO: can we replace this mutex with events system?
  while (isProcessing) {
    await sleep(500);
  }
  return tokenPricesCache;
};

const getAmmLpPrices = async () => {
  while (isProcessing) {
    await sleep(500);
  }
  return lpPricesCache;
};

const getAmmTokenPrice = async tokenSymbol => {
  const tokenPrices = await getAmmTokensPrices();
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    return tokenPrices[tokenSymbol];
  }
  console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
};

const getAmmLpPrice = async lpName => {
  const lpPrices = await getAmmLpPrices();
  if (lpPrices.hasOwnProperty(lpName)) {
    return lpPrices[lpName];
  }
  console.error(`Unknown liqudity pair '${lpName}'. Consider adding it to .json file`);
};

// Flexible delayed initialization used to work around ratelimits
setTimeout(updateAmmPrices, INIT_DELAY);

module.exports = {
  getAmmTokenPrice,
  getAmmTokensPrices,
  getAmmLpPrice,
  getAmmLpPrices,
};
