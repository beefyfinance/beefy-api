const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getStargateV2Apys } = require('../common/stargate/getStargateV2Apys');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');

const poolsV1 = require('../../../data/ethereum/stargateEthPools.json');
const poolsV2 = require('../../../data/ethereum/stargateV2EthPools.json');

const getStargateEthApys = async () => {
  const apysV1 = await getMasterChefApys({
    chainId,
    masterchef: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools: poolsV1,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

  const apysV2 = await getStargateV2Apys({
    chainId,
    masterchef: '0xFF551fEDdbeDC0AeE764139cCD9Cb644Bb04A6BD',
    pools: poolsV2,
    //log: true
  });

  const apys = { ...apysV1.apys, ...apysV2.apys };
  const apyBreakdowns = { ...apysV1.apyBreakdowns, ...apysV2.apyBreakdowns };

  return { apys: apys, apyBreakdowns: apyBreakdowns };
};

module.exports = getStargateEthApys;
