import { getHopCommonApys } from '../common/hop/getHopCommonApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

import pools from '../../../data/arbitrum/hopRplPools.json';
import { hopArbClient } from '../../../apollo/client';
import { HOP_LPF } from '../../../constants';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
const {
  arbitrum: {
    tokens: { RPL },
  },
} = addressBook;

export const getHopRplApys = async () => {
  return await getHopCommonApys({
    pools,
    oracleId: 'RPL',
    oracle: 'tokens',
    tokenAddress: RPL.address,
    decimals: getEDecimals(RPL.decimals),
    chainId,
    isRewardInXToken: false,
    client: hopArbClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
};

module.exports = { getHopRplApys };
