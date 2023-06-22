import { AVAX_CHAIN_ID } from '../../../constants';

import { getMiniChefApys } from '../common/getMiniChefApys';
const { pangolinClient } = require('../../../apollo/client');

import pools from '../../../data/avax/pangolinv2LpPools.json';
import { PANGOLIN_LPF } from '../../../constants';

import { addressBook } from '../../../../packages/address-book/address-book';
import PangolinChef from '../../../abis/avax/PangolinChef';
const {
  avax: {
    platforms: {
      pangolin: { minichef },
    },
    tokens: { PNG },
  },
} = addressBook;

export const getPangolinV2Apys = () => {
  return getMiniChefApys({
    minichefConfig: {
      minichef,
      minichefAbi: PangolinChef,
      outputOracleId: PNG.symbol,
      tokenPerSecondContractMethodName: 'rewardPerSecond',
    },
    pools,
    tradingClient: pangolinClient,
    sushiClient: false,
    liquidityProviderFee: PANGOLIN_LPF,
    chainId: AVAX_CHAIN_ID,
  });
};
