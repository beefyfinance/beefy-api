const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/MarshMasterChef.json');
const pools = require('../../../../data/degens/marshLpPools.json');

const getMarshLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0x8932a6265b01D1D4e1650fEB8Ac38f9D79D3957b',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'mashPerBlock',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'mash-mash',
        poolId: 4,
        token: '0x787732f27D18495494cea3792ed7946BbCFF8db2',
      },
    ],
    oracleId: 'MASH',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getMarshLpApys;
