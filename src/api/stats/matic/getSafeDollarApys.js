const getMasterChefApys = require('./getMaticMasterChefApys');

const SushiComplexRewarderTime = require('../../../abis/matic/SushiComplexRewarderTime.json');
const pools = require('../../../data/matic/safeDollarLpPools.json');

const getSafeDollarApys = async () =>
  getMasterChefApys({
    masterchef: '0x029D14479B9497B95CeD7DE6DAbb023E31b4a1C3',
    masterchefAbi: SushiComplexRewarderTime,
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    //  liquidityProviderFee: 0.018,
    //  tradingFeeInfoClient: wexpolyClient,
    pools: pools,
    oracle: 'tokens',
    oracleId: 'SDS',
    decimals: '1e18',
    // log: true,
  });

module.exports = getSafeDollarApys;
