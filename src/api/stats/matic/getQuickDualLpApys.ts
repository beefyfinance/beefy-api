import { QUICK_LPF } from '../../../constants';

import { getRewardPoolDualApys } from '../common/getRewardPoolDualApys';
import pools from '../../../data/matic/quickDualLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const {
  polygon: {
    tokens: { QUICK, MATIC },
  },
} = addressBook;

export const getQuickDualLpApys = async () =>
  await getRewardPoolDualApys({
    pools,
    oracleIdA: QUICK.oracleId,
    oracleA: 'tokens',
    decimalsA: getEDecimals(QUICK.decimals),
    oracleIdB: MATIC.oracleId,
    oracleB: 'tokens',
    decimalsB: getEDecimals(MATIC.decimals),
    tokenAddress: QUICK.address,
    decimals: getEDecimals(QUICK.decimals),
    chainId: 137,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    xTokenConfig: {
      xTokenAddress: '0xf28164A485B0B2C90639E47b0f377b4a438a16B1',
      isXTokenAorB: 'A',
    },
    // log: true,
  });
