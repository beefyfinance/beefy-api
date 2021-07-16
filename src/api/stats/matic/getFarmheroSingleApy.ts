import { polygonWeb3 as web3 } from '../../../utils/web3';
import getMultiFeeDistributionSingleAssetApy from '../common/getMultiFeeDistributionSingleAssetApy';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  polygon: {
    platforms: { farmhero },
    tokens: { HONOR, WMATIC },
  },
} = addressBook;

const getAddyApy = async () =>
  await getMultiFeeDistributionSingleAssetApy({
    web3,
    multiFeeDistributionAddress: farmhero.multiFeeDistribution,
    wantTokenOracleId: HONOR.symbol,
    outputTokenOracleId: WMATIC.symbol,
    outputTokenAddress: WMATIC.address,
    poolName: 'farmhero-honor',
  });

module.exports = getAddyApy;
