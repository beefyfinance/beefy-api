import { GNOSIS_CHAIN_ID as chainId } from '../../../constants';
import { balancerGnosisClient as client } from '../../../apollo/client';
import { getAuraApys } from '../common/balancer/getAuraApys';

const pools = require('../../../data/gnosis/auraPools.json');

const aaveDataProvider = '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654';
const auraMinter = '0x8b2970c237656d3895588B99a8bFe977D5618201';
const balVault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

const getAuraGnosisApys = async () => {
  return getAuraApys({
    chainId: chainId,
    client: client,
    pools: pools,
    balancerVault: balVault,
    aaveDataProvider: aaveDataProvider,
    auraMinter: auraMinter,
    // log: true,
  });
};

module.exports = getAuraGnosisApys;
