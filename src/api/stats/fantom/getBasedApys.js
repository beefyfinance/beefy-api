const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/fantom/basedLpPools.json');
import { spookyClient } from '../../../apollo/client';
import { SPOOKY_LPF } from '../../../constants';

const getBasedApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xAc0fa95058616D7539b6Eecb6418A68e7c18A746',
    tokenPerBlock: 'bSharePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'BSHARE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  });

module.exports = getBasedApys;
