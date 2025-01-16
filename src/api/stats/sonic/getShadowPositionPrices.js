const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/sonic/shadowLpPools.json');

const getShadowPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 146,
    beefyHelper: '0x5BDC0dFEe73De1bFf5480307335f7D7F90d437fC',
    nftManager: '0x12E66C8F215DdD5d48d150c8f46aD0c6fB0F4406',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getShadowPositionPrices;
