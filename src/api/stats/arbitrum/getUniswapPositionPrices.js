const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/arbitrum/uniswapLpPools.json');

const getUniswapPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 42161,
    beefyHelper: '0x8ef338649a61aCe9F9FB45dd2FD817e2d5f1343a',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getUniswapPositionPrices;
