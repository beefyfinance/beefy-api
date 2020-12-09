const { getDailyEarnings } = require('../../../utils/getDailyEarnings');

let earned = {};
let loop_interval = 60000;

const dailyEarnings = async () => {
  if (Object.keys(earned).length === 0 && earned.constructor === Object) {
    earned = await getDailyEarnings();
  }

  return earned;
};

const getEarningsLoop = async () => {
  earned = await getDailyEarnings();
}

setInterval(function(){ 
  getEarningsLoop(); 
}, loop_interval);

module.exports = dailyEarnings;
