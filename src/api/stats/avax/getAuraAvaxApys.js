import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import { balancerAvaxClient as client } from '../../../apollo/client';
import { getAuraApys } from '../common/balancer/getAuraApys';
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  avax: {
    platforms: { balancer },
  },
} = addressBook;

const pools = require('../../../data/avax/auraLpPools.json');

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const auraMinter = '0x8b2970c237656d3895588B99a8bFe977D5618201';

const getAuraAvaxApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

module.exports = getAuraAvaxApys;
