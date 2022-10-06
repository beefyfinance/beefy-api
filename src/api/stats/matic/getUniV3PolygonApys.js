const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const { getUniV3Apys } = require('../common/getUniV3Apys');
const pools = require('../../../data/matic/uniswapLpPools.json');
const { uniswapPolygonClient: client } = require('../../../apollo/client');

const getUniV3PolygonApys = async () => {
  return getUniV3Apys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    client: client,
    // log: true,
  });
};

module.exports = getUniV3PolygonApys;
