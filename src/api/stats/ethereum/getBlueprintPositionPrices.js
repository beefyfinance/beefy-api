const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/ethereum/blueprintLpPools.json');

const getBlueprintPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 1,
    beefyHelper: '0x70FcD79981f16277513030400a1f9fBc32A64C83',
    nftManager: '0xdC6F8E434a7E0db46D416b6959d8175DAFa5be53',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getBlueprintPositionPrices;
