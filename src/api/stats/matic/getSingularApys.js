import { APEPOLY_LPF } from '../../../constants';

const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/singularLpPools.json');
import { apePolyClient } from '../../../apollo/client';

const getSingularApys = async () =>
  await getMasterChefApys({
    masterchef: '0x9762Fe3ef5502dF432de41E7765b0ccC90E02e92',
    tokenPerBlock: 'singPerSec',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SING',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: apePolyClient,
    liquidityProviderFee: APEPOLY_LPF,
    // log: true,
  });

module.exports = { getSingularApys };
