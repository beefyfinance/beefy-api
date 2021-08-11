const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/pearzapLpPools.json');
import { wexpolyClient } from '../../../apollo/client';

const getPearzapApys = async () =>
  await getMasterChefApys({
    masterchef: '0xb12FeFC21b12dF492609942172412d4b75CbC709',
    tokenPerBlock: 'pearPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'PEAR',
    oracle: 'tokens',
    decimals: '1e18',
    // tradingFeeInfoClient: wexpolyClient,
    liquidityProviderFee: 0.002,
    // log: true,
  });

module.exports = { getPearzapApys };
