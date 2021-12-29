import { getMasterChefApys } from '../common/getMasterChefApys';
import MasterChefAbi from '../../../abis/matic/MaiFarmChef.json';
const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
import pools from '../../../data/avax/maiLpPools.json';
import { joeClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { AbiItem } from 'web3-utils';

const mai = addressBook.avax.platforms.mai;

export const getMaiApys = () => {
  return getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: mai.chef,
    masterchefAbi: MasterChefAbi as AbiItem[],
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [],
    oracle: 'tokens',
    oracleId: 'avaxQI',
    decimals: '1e18',
    tradingFeeInfoClient: joeClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });
};
