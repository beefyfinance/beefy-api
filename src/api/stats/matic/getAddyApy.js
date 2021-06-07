const { polygonWeb3: web3 } = require('../../../utils/web3');
const getMultiFeeDistributionSingleAssetApy = require('../common/getMultiFeeDistributionSingleAssetApy');
const { addressBook } = require('blockchain-addressbook');
const {
  polygon: {
    platforms: { adamant },
    tokens: { ADDY, QUICK },
  },
} = addressBook;

const getAddyApy = async () =>
  await getMultiFeeDistributionSingleAssetApy({
    web3,
    multiFeeDistributionAddress: adamant.multiFeeDistribution,
    wantTokenOracleId: ADDY.symbol,
    outputTokenOracleId: QUICK.symbol,
    outputTokenAddress: QUICK.address,
    poolName: 'adamant-addy',
  });

module.exports = getAddyApy;
