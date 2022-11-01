import { getHopCommonApys } from '../common/hop/getHopCommonApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

import pools from '../../../data/optimism/hopPools.json';
import { hopOpClient } from '../../../apollo/client';
import { HOP_LPF } from '../../../constants';
const { optimismWeb3: web3 } = require('../../../utils/web3');
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
const {
  optimism: {
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
    web3,
    chainId,
    isRewardInXToken: false,
    client: hopOpClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
}

module.exports = { getHopApys };