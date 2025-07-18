import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import { beetOpClient as client } from '../../../apollo/client';
import { getAuraApys } from '../common/balancer/getAuraApys';
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  optimism: {
    platforms: { beethovenX },
  },
} = addressBook;

const auraPools = require('../../../data/optimism/auraLpPools.json');
const auraV3Pools = require('../../../data/optimism/auraV3Pools.json');
const pools = [...auraPools, ...auraV3Pools];

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const auraMinter = '0xeC1c780A275438916E7CEb174D80878f29580606';

const getAuraOptimismApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: beethovenX.router,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

module.exports = getAuraOptimismApys;
