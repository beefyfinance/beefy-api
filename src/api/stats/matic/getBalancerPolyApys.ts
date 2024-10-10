import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import { balancerPolyClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  polygon: {
    platforms: { balancer },
  },
} = addressBook;

const pools = require('../../../data/matic/balancerPolyLpPools.json');

const aaveDataProvider = '0x7F23D86Ee20D869112572136221e173428DD740B';

const getBalancerPolyApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

module.exports = getBalancerPolyApys;
