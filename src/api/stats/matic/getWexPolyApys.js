const getMasterChefApys = require('./getMaticMasterChefApys');

const MasterChefAbi = require('../../../abis/WaltMaster.json');
const pools = require('../../../data/matic/wexPolyLpPools.json');
const { wexpolyClient } = require('../../../apollo/client');

const getWexPolyApys = async () =>
  getMasterChefApys({
    masterchef: '0xC8Bd86E5a132Ac0bf10134e270De06A8Ba317BFe',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'wexPerBlock',
    hasMultiplier: false,
    //  liquidityProviderFee: 0.018,
    //  tradingFeeInfoClient: wexpolyClient,
    pools: pools,
    singlePools: [
      {
        name: 'wexpoly-wex',
        poolId: 1,
        address: '0x4c4BF319237D98a30A929A96112EfFa8DA3510EB',
        oracle: 'tokens',
        oracleId: 'WEXpoly',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'WEXpoly',
    decimals: '1e18',
    // log: true,
  });

module.exports = getWexPolyApys;
