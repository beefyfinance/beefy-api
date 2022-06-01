const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId, QUICK_LPF } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/matic/ripaeLpPools.json');
const { quickClient } = require('../../../apollo/client');

const getRipaeApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0xa4dC4c7624acE1b415e6D937E694047b517F2D99',
    tokenPerBlock: 'paePerSecond',
    hasMultiplier: false,
    pools,
    oracleId: 'PAE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

module.exports = getRipaeApys;
