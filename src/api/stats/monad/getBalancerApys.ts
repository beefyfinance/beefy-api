import { balancerBaseClient as client } from '../../../apollo/client.ts';
import { ApiChainId } from '../../../utils/chain.ts';
import { getBalancerApys } from '../common/balancer/getBalancerApys.ts';
import balancerV3Pools from '../../../data/monad/balancerV3Pools.json' with { type: 'json' };

const pools = [...balancerV3Pools];

//const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';

const getBalancerMonadApys = async () => {
  return getBalancerApys({
    chainId: ApiChainId.monad,
    client: client,
    pools: pools as any,
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    //aaveDataProvider: aaveDataProvider,
    // log: true,
  });
};

export default getBalancerMonadApys;
