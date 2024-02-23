const getUniV3PositionPrices = require('../common/getUniV3PositionPrices');
const pools = require('../../../data/arbitrum/uniswapLpPools.json');

const getUniswapPositionPrices = async tokenPrices => {
  const params = {
    pools: pools,
    tokenPrices: tokenPrices,
    chainId: 42161,
    beefyHelper: '0x9a7006E936f5aBe8E0FAf24068e1e120fB0DB79e',
    nftManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  };

  return await getUniV3PositionPrices(params);
};

module.exports = getUniswapPositionPrices;
