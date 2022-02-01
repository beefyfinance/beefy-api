const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/avax/grapeLpPools.json');
import { joeClient } from '../../../apollo/client';
import { JOE_LPF } from '../../../constants';

const getGrapeApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x28c65dcB3a5f0d456624AFF91ca03E4e315beE49',
    tokenPerBlock: 'winePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'WINE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: joeClient,
    liquidityProviderFee: JOE_LPF,
    // log: true,
  });

module.exports = getGrapeApys;
