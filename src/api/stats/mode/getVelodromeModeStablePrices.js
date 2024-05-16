const getSolidlyStablePrices = require('../common/getSolidlyStablePrices');
const pools = require('../../../data/mode/velodromeModeStablePools.json');
const { MODE_CHAIN_ID } = require('../../../constants');

const getVelodromeModeStablePrices = async tokenPrices => {
  return await getSolidlyStablePrices(MODE_CHAIN_ID, pools, tokenPrices);
};

module.exports = getVelodromeModeStablePrices;
