import { JOE_LPF } from '../../../constants';

const { getMasterChefApys } = require('../common/getMasterChefApys');
const { avaxWeb3 } = require('../../../utils/web3');
const pools = require('../../../data/avax/singularLpPools.json');
import { joeClient } from '../../../apollo/client';

const getSingularApys = async () =>
  await getMasterChefApys({
    web3: avaxWeb3,
    chainId: 43114,
    masterchef: '0xF2599B0c7cA1e3c050209f3619F09b6daE002857',
    tokenPerBlock: 'singPerSec',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SING',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: joeClient,
    liquidityProviderFee: JOE_LPF,
    // log: true,
  });

module.exports = getSingularApys;
