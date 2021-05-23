const getMasterChefApys = require('../degens/getMasterChefApys');

const MasterChefAbi = require('../../../../abis/MasterChef.json');
const pools = require('../../../../data/jetswapLpPools.json');

const getJetswapApys = async () =>
  await getMasterChefApys({
    masterchef: '0x63d6EC1cDef04464287e2af710FFef9780B6f9F5',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'jetswap-wings',
        poolId: 0,
        token: '0x0487b824c8261462F88940f97053E65bDb498446',
      },
    ],
    oracleId: 'WINGS',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = getJetswapApys;
