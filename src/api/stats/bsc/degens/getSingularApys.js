import { APE_LPF } from '../../../../constants';

const getMasterChefApys = require('./getBscMasterChefApys');
const pools = require('../../../../data/degens/singularLpPools.json');
import { apeClient } from '../../../../apollo/client';

const getSingularApys = async () =>
  await getMasterChefApys({
    masterchef: '0x31B05a72037E91B86393a0f935fE7094141ba0a7',
    tokenPerBlock: 'singPerSec',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SING',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: APE_LPF,
    // log: true,
  });

module.exports = getSingularApys;
