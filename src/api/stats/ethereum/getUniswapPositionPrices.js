const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/ethereum/uniswapLpPools.json');

const getUniswapPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 1,
    beefyHelper: '0xC90C555718fBC176609fc8AfCED1f4A6482adc56',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getUniswapPositionPrices;
