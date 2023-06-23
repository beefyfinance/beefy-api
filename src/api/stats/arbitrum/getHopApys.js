import { getHopCommonApys } from '../common/hop/getHopCommonApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

import pools from '../../../data/arbitrum/hopPools.json';
import { hopArbClient } from '../../../apollo/client';
import { HOP_LPF } from '../../../constants';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
const {
  arbitrum: {
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
    client: hopArbClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
};

module.exports = { getHopApys };
