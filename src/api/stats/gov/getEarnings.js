const { getDailyEarnings }   = require('../../../utils/getDailyEarnings');
const { getRewardsReceived } = require('../../../utils/getRewardsReceived');

const INTERVAL = 30 * 60 * 1000;

let earned = {};

const updateEarnings = async () => {
  earned = await getDailyEarnings();
  earned.total = await getRewardsReceived();
  setTimeout(updateEarnings, INTERVAL);
}

const dailyEarnings = async () => {
  return earned;
};

updateEarnings();

module.exports = dailyEarnings;
