const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/sonic/shadowLpPools.json');

const getShadowPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 146,
    beefyHelper: '0xFA06a20bF32C8c74a53aFF0e1E1639F300d514a1',
    nftManager: '0x12E66C8F215DdD5d48d150c8f46aD0c6fB0F4406',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getShadowPositionPrices;
