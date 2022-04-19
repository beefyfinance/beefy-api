const { getDailyEarnings } = require('../../../utils/getDailyEarnings');
const { getRewardsReceived } = require('../../../utils/getRewardsReceived');
const { getKey, setKey } = require('../../../utils/redisHelper');

const INIT_DELAY = 2 * 60 * 1000;
const INTERVAL = 60 * 60 * 1000;

let earned = {};

const updateEarnings = async () => {
  console.log('> updating earnings');

  // TODO: this looks like a nice candidate for a subgraph
  try {
    earned = await getDailyEarnings();
    earned.total = await getRewardsReceived();
    console.log('> updated earnings');
    saveToRedis();
  } catch (err) {
    console.error('> earnings updated failed', err);
  }

  setTimeout(updateEarnings, INTERVAL);
};

const dailyEarnings = async () => {
  return earned;
};

const initEarningsService = async () => {
  const cachedEarnings = await getKey('EARNINGS');
  earned = cachedEarnings ?? {};

  setTimeout(updateEarnings, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey('EARNINGS', earned);
  console.log('Earnings saved to redis');
};

module.exports = { dailyEarnings, initEarningsService };
