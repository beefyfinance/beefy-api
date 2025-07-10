const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');

const poolsV2 = require('../../../data/ethereum/stargateV2EthPools.json');

const getStargateEthApys = async () => {
  return getStargateV2Apys({
    chainId,
    masterchef: '0xFF551fEDdbeDC0AeE764139cCD9Cb644Bb04A6BD',
    pools: poolsV2,
    //log: true
  });
};

module.exports = getStargateEthApys;
