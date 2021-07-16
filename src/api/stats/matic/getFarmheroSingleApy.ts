import { polygonWeb3 as web3 } from '../../../utils/web3';
import getMultiFeeDistributionSingleAssetApy, {
  MultiFeeDistributionSingleAssetApyParams,
} from '../common/getMultiFeeDistributionSingleAssetApy';
import { addressBook } from '../../../../packages/address-book/address-book';
import { ApyBreakdownResult } from '../common/getApyBreakdown';
const {
  polygon: {
    platforms: { farmhero },
    tokens: { HONOR, WMATIC },
  },
} = addressBook;

export const getFarmheroSingleApy = async (): Promise<ApyBreakdownResult> => {
  const params: MultiFeeDistributionSingleAssetApyParams = {
    web3,
    multiFeeDistributionAddress: farmhero.multiFeeDistribution,
    wantTokenOracleId: HONOR.symbol,
    outputTokenOracleId: WMATIC.symbol,
    outputTokenAddress: WMATIC.address,
    poolName: 'farmhero-honor',
  };
  const apy: ApyBreakdownResult = await getMultiFeeDistributionSingleAssetApy(params);
  return apy;
};
