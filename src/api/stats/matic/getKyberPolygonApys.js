const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const { getKyberLpV2Apys } = require('../common/getKyberLpV2Apys');
const ABI = require('../../../abis/IKyberFairLaunch.json');
const pools = require('../../../data/matic/kyberV2LpPools.json');

const getKyberPolygonApys = async () => {
  return getKyberLpV2Apys({
    masterchef: '0xFFD22921947D75342BFE1f8efAcEE4B8B3b5183F',
    web3: web3,
    chainId: chainId,
    pools: pools,
    abi: ABI,
    // log: true,
  });
};

module.exports = getKyberPolygonApys;
