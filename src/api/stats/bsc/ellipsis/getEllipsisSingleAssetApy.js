const { bscWeb3: web3 } = require('../../../../utils/web3');

const getMultiFeeDistributionSingleAssetApy = require('../../common/getMultiFeeDistributionSingleAssetApy');

const getEllipsisSingleAssetApy = async () =>
  await getMultiFeeDistributionSingleAssetApy({
    web3,
    multiFeeDistributionAddress: '0x4076CC26EFeE47825917D0feC3A79d0bB9a6bB5c',
    wantTokenOracleId: 'EPS',
    outputTokenOracleId: 'BUSD',
    outputTokenAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    poolName: 'ellipsis-eps',
  });

module.exports = getEllipsisSingleAssetApy;
