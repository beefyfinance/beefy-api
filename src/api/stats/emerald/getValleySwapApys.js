const { emeraldWeb3: web3 } = require('../../../utils/web3');
const { EMERALD_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/emerald/valleySwapLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  emerald: {
    platforms: {
      valleyswap: { masterchef },
    },
    tokens: { VS },
  },
} = addressBook;

const getValleySwapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: masterchef,
    tokenPerBlock: 'vsPerSecond',
    secondsPerBlock: 1, // since block rewards are per second
    allocPointIndex: 2,
    hasMultiplier: false,
    pools: pools,
    oracleId: VS.symbol,
    oracle: 'tokens',
    decimals: '1e18',
    log: true,
  });

module.exports = getValleySwapApys;
