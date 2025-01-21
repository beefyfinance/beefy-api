import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { balancerArbClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  arbitrum: {
    platforms: { balancer },
  },
} = addressBook;

const pools = require('../../../data/arbitrum/balancerArbLpPools.json');

const aaveDataProvider = '0x7F23D86Ee20D869112572136221e173428DD740B';

const getBalancerArbApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

module.exports = getBalancerArbApys;
