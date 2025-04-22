import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { balancerArbClient as client } from '../../../apollo/client';
import { getAuraApys } from '../common/balancer/getAuraApys';
import { addressBook } from '../../../../packages/address-book/src/address-book';
import auraV3Pools from '../../../data/arbitrum/auraV3Pools.json';
import auraPools from '../../../data/arbitrum/auraLpPools.json';

const {
  arbitrum: {
    platforms: { balancer },
  },
} = addressBook;

const pools = [...auraPools, ...auraV3Pools];

const aaveDataProvider = '0x7F23D86Ee20D869112572136221e173428DD740B';
const auraMinter = '0xeC1c780A275438916E7CEb174D80878f29580606';

const getAuraArbitrumApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools.filter(p => !p.eol),
    balancerVault: balancer.router,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

module.exports = getAuraArbitrumApys;
