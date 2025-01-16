const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/sonic/shadowLpPools.json');

const getShadowPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 146,
    beefyHelper: '0x70FcD79981f16277513030400a1f9fBc32A64C83',
    nftManager: '0xFA06a20bF32C8c74a53aFF0e1E1639F300d514a1',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getShadowPositionPrices;
