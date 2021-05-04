const { getDailyEarnings } = require('../../../utils/getDailyEarnings');
const { getRewardsReceived } = require('../../../utils/getRewardsReceived');

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
  } catch (err) {
    console.error('> earnings updated failed', err);
  }

  setTimeout(updateEarnings, INTERVAL);
};

const dailyEarnings = async () => {
  return earned;
};

setTimeout(updateEarnings, INIT_DELAY);

module.exports = dailyEarnings;
