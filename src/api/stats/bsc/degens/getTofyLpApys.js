const getMasterChefApys = require('./getMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/TofyMasterChef.json');
const pools = require('../../../../data/degens/tofyLpPools.json');

const getTofyLpApys = async () =>
  await getMasterChefApys({
    masterchef: '0xEE49Aa34833Ca3b7d873ED63CDBc031A09226a5d',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'tofyPerBlock',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'tofy-tofy',
        poolId: 2,
        token: '0xE1F2d89a6c79b4242F300f880e490A70083E9A1c',
      },
    ],
    oracleId: 'TOFY',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getTofyLpApys;
