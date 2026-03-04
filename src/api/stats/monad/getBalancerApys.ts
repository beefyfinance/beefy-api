import { MONAD_CHAIN_ID as chainId } from '../../../constants';
import { balancerBaseClient as client } from '../../../apollo/client';
const { getBalancerApys } = require('../common/balancer/getBalancerApys');
import balancerV3Pools from '../../../data/monad/balancerV3Pools.json';

const pools = [...balancerV3Pools];

//const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerMonadApys = async () => {
  return getBalancerApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    //aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

module.exports = getBalancerMonadApys;
