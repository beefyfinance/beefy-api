const { getMasterChefApys } = require('../../common/getMasterChefApys');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');

const pools = require('../../../../data/bsc/stargateBscPools.json');

const getStargateBscApys = async () =>
  await getMasterChefApys({
    chainId,
    masterchef: '0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    pools,
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateBscApys;
