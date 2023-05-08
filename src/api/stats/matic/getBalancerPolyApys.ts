import { polygonWeb3 as web3 } from '../../../utils/web3';
import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import { balancerPolyClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  polygon: {
    platforms: { balancer },
  },
} = addressBook;

const pools = require('../../../data/matic/balancerPolyLpPools.json');

const aaveDataProvider = '0x7551b5D2763519d4e37e8B81929D336De671d46d';

const getBalancerPolyApys = async () => {
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

module.exports = getBalancerPolyApys;
