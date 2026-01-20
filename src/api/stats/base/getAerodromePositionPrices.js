const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/base/aerodromeClPools.json');

const getAerodromePositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 8453,
    beefyHelper: '0xA73E3bD2E38B291Ba8E56E9badD3F090694B7Ed2',
    nftManager: '0x827922686190790b37229fd06084350E74485b72',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getAerodromePositionPrices;
