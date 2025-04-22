import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { balancerArbClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/src/address-book';
import balancerV3Pools from '../../../data/arbitrum/balancerV3Pools.json';
import balancerPools from '../../../data/arbitrum/balancerArbLpPools.json';

const {
  arbitrum: {
    platforms: { balancer },
  },
} = addressBook;

const pools = [...balancerPools, ...balancerV3Pools];

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
