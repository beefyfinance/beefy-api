import { arbitrumWeb3 as web3 } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { balancerArbClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  arbitrum: {
    platforms: { balancer },
  },
} = addressBook;

const pools = require('../../../data/arbitrum/balancerArbLpPools.json');

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerArbApys = async () => {
  return getBalancerApys({
    web3: web3,
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

module.exports = getBalancerArbApys;
