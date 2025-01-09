const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/linea/stargateV2LineaPools.json');

const getStargateLineaApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0x25BBf59ef9246Dc65bFac8385D55C5e524A7B9eA',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateLineaApys;
