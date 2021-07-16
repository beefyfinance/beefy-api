import { bscWeb3 as web3 } from '../../../../utils/web3';
import getMultiFeeDistributionSingleAssetApy, {
  MultiFeeDistributionSingleAssetApyParams,
} from '../../common/getMultiFeeDistributionSingleAssetApy';
import { addressBook } from '../../../../../packages/address-book/address-book';
import { ApyBreakdownResult } from '../../common/getApyBreakdown';
const {
  bsc: {
    platforms: { ellipsis },
    tokens: { EPS, BUSD },
  },
} = addressBook;

const getEllipsisSingleAssetApy = async () => {
  const params: MultiFeeDistributionSingleAssetApyParams = {
    web3,
    multiFeeDistributionAddress: ellipsis.multiFeeDistribution,
    want: EPS,
    output: BUSD,
    poolName: 'ellipsis-eps',
  };
  const apy: ApyBreakdownResult = await getMultiFeeDistributionSingleAssetApy(params);
  return apy;
};

export default getEllipsisSingleAssetApy;
