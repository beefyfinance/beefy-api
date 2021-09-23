import { QUICK_LPF } from '../../../constants';

import { getMasterChefApys } from './getMaticMasterChefApys';
import pools from '../../../data/matic/polywiseLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const {
  polygon: {
    platforms: { polywise },
    tokens: { polyWISE },
  },
} = addressBook;

export const getPolyAlphaApys = async () =>
  await getMasterChefApys({
    masterchef: polywise.masterchef,
    tokenPerBlock: 'WisePerBlock',
    hasMultiplier: false,
    pools,
    oracleId: 'polyWISE',
    oracle: 'tokens',
    decimals: getEDecimals(polyWISE.decimals),
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    log: true,
  });
