import { moonriverWeb3 } from '../../../utils/web3';
import { MOONRIVER_CHAIN_ID } from '../../../constants';

import { getSushiApys } from '../common/getSushiApys';
import { sushiMoonriverClient } from '../../../apollo/client';

import pools from '../../../data/matic/sushiLpPools.json';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  moonriver: {
    platforms: {
      sushi: { minichef, complexRewarderTime },
    },
    tokens: { mSUSHI, WMOVR },
  },
} = addressBook;

export const getSushiLpApys = () => {
  return getSushiApys({
    minichef,
    complexRewarderTime,
    sushiOracleId: mSUSHI.symbol,
    nativeOracleId: WMOVR.symbol,
    nativeTotalAllocPoint: 10000,
    pools,
    sushiClient: sushiMoonriverClient,
    web3: moonriverWeb3,
    chainId: MOONRIVER_CHAIN_ID,
  });
};
