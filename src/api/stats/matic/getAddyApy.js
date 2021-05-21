const { polygonWeb3: web3 } = require('../../../utils/web3');

const getMultiFeeDistributionSingleAssetApy = require('../common/getMultiFeeDistributionSingleAssetApy');

const getAddyApy = async () =>
  await getMultiFeeDistributionSingleAssetApy({
    web3,
    multiFeeDistributionAddress: '0x920f22E1e5da04504b765F8110ab96A20E6408Bd',
    wantTokenOracleId: 'ADDY',
    outputTokenOracleId: 'QUICK',
    outputTokenAddress: '0x831753dd7087cac61ab5644b308642cc1c33dc13',
    poolName: 'adamant-addy',
  });

module.exports = getAddyApy;
