import { BASE_CHAIN_ID as chainId } from '../../../constants';
import { balancerBaseClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  base: {
    platforms: { balancer },
  },
} = addressBook;

const pools = require('../../../data/base/balancerPools.json');

//const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerBaseApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    //aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

module.exports = getBalancerBaseApys;
