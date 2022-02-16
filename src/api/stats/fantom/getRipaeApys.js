const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/fantom/ripaeLpPools.json');
import { spookyClient } from '../../../apollo/client';
import { SPOOKY_LPF } from '../../../constants';

const getGrapeApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xa058316Af6275137B3450C9C9A4022dE6482BaC2',
    tokenPerBlock: 'paePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'PAE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  });

module.exports = getGrapeApys;
