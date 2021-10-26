import { SUSHI_LPF } from '../../../constants';

import { getRewardPoolDualApys } from '../common/getRewardPoolDualApys';
import pools from '../../../data/matic/quickDualLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const { polygonWeb3 } = require('../../../utils/web3');
const {
  polygon: {
    tokens: { QUICK, MATIC },
  },
} = addressBook;

export const getQuickDualLpApys = async () =>
  await getRewardPoolDualApys({
    pools,
    oracleIdA: QUICK.symbol,
    oracleA: 'tokens',
    decimalsA: getEDecimals(QUICK.decimals),
    oracleIdB: MATIC.symbol,
    oracleB: 'tokens',
    decimalsB: getEDecimals(MATIC.decimals),
    tokenAddress: QUICK.address,
    decimals: getEDecimals(QUICK.decimals),
    web3: polygonWeb3,
    chainId: 137,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    xTokenConfig: {
      xTokenAddress: '0xf28164A485B0B2C90639E47b0f377b4a438a16B1',
      isXTokenAorB: 'A',
    },
    // log: true,
  });
