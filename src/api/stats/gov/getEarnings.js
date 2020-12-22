const { getDailyEarnings } = require('../../../utils/getDailyEarnings');

const INTERVAL = 5 * 60 * 1000;

let earned = {};

const updateEarnings = async () => {
  earned = await getDailyEarnings();
  setTimeout(updateEarnings, INTERVAL);
}

const dailyEarnings = async () => {
  return earned;
};

updateEarnings();

module.exports = dailyEarnings;
