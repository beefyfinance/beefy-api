import { getRewardPoolApys } from '../common/getRewardPoolApys';
import pools from '../../../data/matic/quickPools.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const { polygonWeb3 } = require('../../../utils/web3');
const {
  polygon: {
    tokens: { QUICK },
  },
} = addressBook;

export const getQuickSingleApys = async () =>
  await getRewardPoolApys({
    pools,
    oracleId: 'COT',
    oracle: 'tokens',
    tokenAddress: QUICK.address,
    decimals: getEDecimals(QUICK.decimals),
    web3: polygonWeb3,
    chainId: 137,
    log: false,
  });
