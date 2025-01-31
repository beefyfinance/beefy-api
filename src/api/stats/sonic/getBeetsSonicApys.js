import { SONIC_CHAIN_ID as chainId } from '../../../constants';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import { addressBook } from '../../../../packages/address-book/src/address-book';

const pools = require('../../../data/sonic/beetsPools.json');
const beetsV3Pools = require('../../../data/sonic/beetsV3Pools.json');

const getBeetsSonicApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    pools: [...pools, ...beetsV3Pools],
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    // log: true,
  });
};

module.exports = getBeetsSonicApys;
