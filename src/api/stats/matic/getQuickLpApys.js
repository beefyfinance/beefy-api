import { QUICK_LPF } from '../../../constants';

import { getRewardPoolApys } from '../common/getRewardPoolApys';
import pools from '../../../data/matic/quickLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const { polygonWeb3 } = require('../../../utils/web3');
const {
  polygon: {
    tokens: { QUICK },
  },
} = addressBook;

export const getQuickLpApys = async () =>
  await getRewardPoolApys({
    pools,
    oracleId: 'QUICK',
    oracle: 'tokens',
    tokenAddress: QUICK.address,
    decimals: getEDecimals(QUICK.decimals),
    web3: polygonWeb3,
    chainId: 137,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    isRewardInXToken: true,
    xTokenAddress: '0xf28164A485B0B2C90639E47b0f377b4a438a16B1',
    // log: true,
  });