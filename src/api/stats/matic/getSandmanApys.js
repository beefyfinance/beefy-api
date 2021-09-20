import { QUICK_LPF } from '../../../constants';

const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/sandmanLpPools.json');
import { quickClient } from '../../../apollo/client';

const getSandmanApys = async () =>
  await getMasterChefApys({
    masterchef: '0xd3976E92a48821DD1122Ae5e8265b14595aF34d2',
    tokenPerBlock: 'deliriumPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'DELIRIUM',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: QUICK_LPF,
    // log: true,
  });

module.exports = { getSandmanApys };
