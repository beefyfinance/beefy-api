const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/cronos/scrubLpPools.json');
import { vvsClient } from '../../../apollo/client';

const getScrubApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800',
    tokenPerBlock: 'tSharePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'TIGER',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: vvsClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getScrubApys;
