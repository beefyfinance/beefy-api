const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const GiddyChef = require('../../../abis/matic/GiddyChef.json');
const { sushiClient } = require('../../../apollo/client');

const pools = require('../../../data/matic/giddyPools.json');
const lpPools = require('../../../data/matic/giddyLpPools.json');

const getGiddyApys = async () => {
  return await getMasterChefApys({
    web3: web3,
    chainId: POLYGON_CHAIN_ID,
    masterchef: '0xd814b26554204245A30F8A42C289Af582421Bf04',
    masterchefAbi: GiddyChef,
    tokenPerBlock: 'giddyPerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    pools: pools.concat(lpPools),
    oracle: 'tokens',
    oracleId: 'GIDDY',
    decimals: '1e18',
    liquidityProviderFee: 0.003,
    tradingFeeInfoClient: sushiClient,
    // log: true,
  });
};

module.exports = getGiddyApys;
