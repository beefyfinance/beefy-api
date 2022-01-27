const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const SpellMasterChef = require('../../../abis/arbitrum/SpellMasterChef.json');
const { sushiClient } = require('../../../apollo/client');

const pools = require('../../../data/matic/popsicleLpPools.json');

const getPopsicleApys = async () => {
  return await getMasterChefApys({
    web3: web3,
    chainId: POLYGON_CHAIN_ID,
    masterchefAbi: SpellMasterChef,
    masterchef: '0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c',
    tokenPerBlock: 'icePerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    allocPointIndex: '4',
    pools: pools,
    oracleId: 'ICE',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.003,
    tradingFeeInfoClient: sushiClient,
    // log: true,
  });
};

module.exports = getPopsicleApys;
