const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunch.json');
const pools = require('../../../data/matic/kyberV2LpPools.json');

const getKyberPolygonApys = async () => {
  return getKyberLpV2Apys({
    chainId: chainId,
    pools: pools,
    abi: ABI,
    // log: true,
  });
};

module.exports = getKyberPolygonApys;
