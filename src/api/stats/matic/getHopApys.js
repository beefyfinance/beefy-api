import { getHopCommonApys } from '../common/hop/getHopCommonApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

import pools from '../../../data/matic/hopPools.json';
import { hopPolyClient } from '../../../apollo/client';
import { HOP_LPF } from '../../../constants';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
const {
  polygon: {
    tokens: { HOP },
  },
} = addressBook;

export const getHopApys = async () => {
  return await getHopCommonApys({
    pools,
    oracleId: 'HOP',
    oracle: 'tokens',
    tokenAddress: HOP.address,
    decimals: getEDecimals(HOP.decimals),
    chainId,
    isRewardInXToken: false,
    client: hopPolyClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
};

module.exports = { getHopApys };
