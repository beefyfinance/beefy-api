import { QUICK_LPF } from '../../../constants';

const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/polyalphaLpPools.json');
import { quickClient } from '../../../apollo/client';

const getPolyAlphaApys = async () =>
  await getMasterChefApys({
    masterchef: '0x0B14C435DC29f2e3F53E203a18077F4A41914870',
    tokenPerBlock: 'AlphaPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'polyALPHA',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

module.exports = { getPolyAlphaApys };
