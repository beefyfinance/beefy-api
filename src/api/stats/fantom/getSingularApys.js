import { SPOOKY_LPF } from '../../../constants';

const { getMasterChefApys } = require('../common/getMasterChefApys');
const { fantomWeb3 } = require('../../../utils/web3');
const pools = require('../../../data/fantom/singularLpPools.json');
import { spookyClient } from '../../../apollo/client';

const getSingularApys = async () =>
  await getMasterChefApys({
    web3: fantomWeb3,
    chainId: 250,
    masterchef: '0x9ED04B13AB6cae27ee397ee16452AdC15d9d561E',
    tokenPerBlock: 'singPerSec',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'fSING',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  });

module.exports = getSingularApys;