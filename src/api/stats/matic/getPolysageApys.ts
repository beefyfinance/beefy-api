import { QUICK_LPF } from '../../../constants';

import { getMasterChefApys } from './getMaticMasterChefApys';
import pools from '../../../data/matic/polysageLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const {
  polygon: {
    platforms: { polysage },
    tokens: { polySAGE },
  },
} = addressBook;

export const getPolysageApys = async () =>
  await getMasterChefApys({
    masterchef: polysage.masterchef,
    tokenPerBlock: 'SagePerBlock',
    hasMultiplier: false,
    pools,
    oracleId: 'polySAGE',
    oracle: 'tokens',
    decimals: getEDecimals(polySAGE.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });
