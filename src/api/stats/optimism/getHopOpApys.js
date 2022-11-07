import { getHopCommonApys } from '../common/hop/getHopCommonApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';

import pools from '../../../data/optimism/hopOpPools.json';
import { hopOpClient } from '../../../apollo/client';
import { HOP_LPF } from '../../../constants';
const { optimismWeb3: web3 } = require('../../../utils/web3');
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
const {
  optimism: {
    tokens: { OP },
  },
} = addressBook;

export const getHopOpApys = async () => {
  return await getHopCommonApys({
    pools,
    oracleId: 'OP',
    oracle: 'tokens',
    tokenAddress: OP.address,
    decimals: getEDecimals(OP.decimals),
    web3,
    chainId,
    isRewardInXToken: false,
    client: hopOpClient,
    liquidityProviderFee: HOP_LPF,
    // log: true,
  });
}

module.exports = { getHopOpApys };