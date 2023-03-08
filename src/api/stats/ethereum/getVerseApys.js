import { VERSE_LPF } from '../../../constants';

import { getRewardPoolApys } from '../common/getRewardPoolApys';
import pools from '../../../data/ethereum/verseLpPools.json';
import { verseClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const { ethereumWeb3 } = require('../../../utils/web3');
const {
  ethereum: {
    tokens: { VERSE },
  },
} = addressBook;

export const getVerseLpApys = async () =>
  await getRewardPoolApys({
    pools,
    oracleId: 'VERSE',
    oracle: 'tokens',
    tokenAddress: VERSE.address,
    decimals: getEDecimals(VERSE.decimals),
    web3: ethereumWeb3,
    chainId: 1,
    // tradingFeeInfoClient: verseClient,
    // liquidityProviderFee: VERSE_LPF,
    // log: true,
  });
