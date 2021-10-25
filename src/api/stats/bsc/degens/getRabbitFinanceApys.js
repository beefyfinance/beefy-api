const getMasterChefApys = require('./getBscMasterChefApys');

const MasterChef = require('../../../../abis/degens/RabbitFairLaunch.json');
const pools = require('../../../../data/degens/rabbitLpPools.json');
const { mdexBscClient } = require('../../../../apollo/client');

const getRabbitFinanceApys = async () =>
  await getMasterChefApys({
    masterchef: '0x81C1e8A6f8eB226aA7458744c5e12Fc338746571',
    masterchefAbi: MasterChef,
    tokenPerBlock: 'rabbitPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'RABBIT',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: mdexBscClient,
    liquidityProviderFee: 0.003,
  });

module.exports = getRabbitFinanceApys;
