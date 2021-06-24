const getMasterChefApys = require('./getBscMasterChefApys');

const MasterChefAbi = require('../../../../abis/degens/PantherMasterChef.json');
const pools = require('../../../../data/degens/pantherLpPools.json');
const { pantherClient } = require('../../../../apollo/client');

const getPantherApys = async () =>
  await getMasterChefApys({
    masterchef: '0x058451C62B96c594aD984370eDA8B6FD7197bbd4',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'pantherPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'PANTHER',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: pantherClient,
    liquidityProviderFee: 0.0017,
  });

module.exports = getPantherApys;
