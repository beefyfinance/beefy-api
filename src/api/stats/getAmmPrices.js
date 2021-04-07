const { fetchAmmPoolsPrices } = require('../../utils/getPoolStats');
const { sleep } = require('../../utils/time');

const bakeryPools = require('../../data/bakeryLpPools.json');
const blizzardLpPools = require('../../data/degens/blizzardLpPools.json');
const alpacaLpPools = require('../../data/alpacaLpPools.json');
const cafePools = require('../../data/cafeLpPools.json');
const cakeLpPools = require('../../data/cakeLpPools.json');
const cakePools = require('../../data/cakePools.json');
const jetfuelPools = require('../../data/jetfuelLpPools.json');
const kebabPools = require('../../data/kebabLpPools.json');
const bdollarSbdoPools = require('../../data/bdollarSbdoLpPools.json');
const boltBtdPools = require('../../data/boltBtdLpPools.json');
const boltBtsPools = require('../../data/boltBtsLpPools.json');
const helmetPools = require('../../data/helmetLpPools.json');
const mdexPools = require('../../data/mdexLpPools.json');
const midasPools = require('../../data/midasLpPools.json');
const monsterPools = require('../../data/monsterLpPools.json');
const narPools = require('../../data/narLpPools.json');
const nyacashPools = require('../../data/nyacashLpPools.json');
const nyanswopPools = require('../../data/nyanswopLpPools.json');
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
const pangolinPools = require('../../data/pangolinLpPools.json');
const swipePools = require('../../data/swipeLpPools.json');
const comAvaxPools = require('../../data/comAvaxLpPools.json');
const comBscPools = require('../../data/comBscLpPools.json');
const snowballPools = require('../../data/snobLpPools.json');
const supernovaPools = require('../../data/supernovaLpPools.json');
const pumpyPools = require('../../data/pumpyLpPools.json');
const spacePools = require('../../data/degens/spaceLpPools.json');
const nautPools = require('../../data/degens/nautLpPools.json');
const ellipsisPools = require('../../data/ellipsisLpPools.json');
const hpsPools = require('../../data/degens/hpsLpPools.json');
const zefiPools = require('../../data/degens/zefiLpPools.json');
const thunderPools = require('../../data/degens/thunderLpPools.json');
const swirlPools = require('../../data/swirlLpPools.json');
const getBeltVenusLpPrice = require('./belt/getBeltVenusLpPrice');
const getEllipsis3PoolPrice = require('./ellipsis/getEllipsis3PoolPrice');
const getSnob3PoolPrice = require('./snowball/getSnob3PoolPrice');
const swampyPools = require('../../data/degens/swampyLpPools.json');
const yieldBayPools = require('../../data/degens/yieldBayLpPools.json');
const bingoPools = require('../../data/degens/bingoLpPools.json');
const olivePools = require('../../data/oliveLpPools.json');
const bitiPools = require('../../data/degens/bitiLpPools.json');

const INIT_DELAY = 60 * 1000;
const REFRESH_INTERVAL = 10 * 60 * 1000;

// FIXME: if this list grows too big we might hit the ratelimit on initialization everytime
// Implement in case of emergency -> https://github.com/beefyfinance/beefy-api/issues/103
const pools = [
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
  ...supernovaPools,
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
  ...midasPools,
  ...bdollarSbdoPools,
  ...spongePools,
  ...bakeryPools,
  ...jetfuelPools,
  ...kebabPools,
  ...boltBtdPools,
  ...boltBtsPools,
  ...helmetPools,
  ...mdexPools,
  ...monsterPools,
  ...narPools,
  ...nyacashPools,
  ...nyanswopPools,
  ...thugsPools,
  ...cakeLpPools,
  ...cakePools,
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
    let { poolPrices, tokenPrices } = await fetchAmmPoolsPrices(pools, knownPrices);
    const beltVenusBLP = await getBeltVenusLpPrice();
    const eps3PoolLP = await getEllipsis3PoolPrice();
    const snob3PoolLP = await getSnob3PoolPrice();
    tokenPricesCache = tokenPrices;
    lpPricesCache = { ...poolPrices, ...beltVenusBLP, ...eps3PoolLP, ...snob3PoolLP };
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
