import { getMasterChefApys } from '../common/getMasterChefApys';

const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
import pools from '../../../data/avax/maiLpPools.json';
import { joeClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { JOE_LPF } from '../../../constants';

const mai = addressBook.avax.platforms.mai;

export const getMaiApys = () => {
  return getMasterChefApys({
    chainId: chainId,
    masterchef: mai.chef,
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: pools,
    singlePools: [],
    oracle: 'tokens',
    oracleId: 'avaxQI',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: joeClient,
    liquidityProviderFee: JOE_LPF,
    // log: true,
  });
};
