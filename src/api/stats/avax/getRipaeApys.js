const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/avax/ripaeLpPools.json');
import { joeClient } from '../../../apollo/client';
import { JOE_LPF } from '../../../constants';

const getRipaeApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0xb5cc0Ed74dde9F26fBfFCe08FF78227F4Fa86029',
    tokenPerBlock: 'paePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'PAE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: joeClient,
    liquidityProviderFee: JOE_LPF,
    // log: true,
  });

module.exports = getRipaeApys;
