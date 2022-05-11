const { emeraldWeb3: web3 } = require('../../../utils/web3');
const { EMERALD_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/emerald/yuzuLpPools.json');
const getBlockTime = require('../../../utils/getBlockTime');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  emerald: {
    platforms: {
      yuzu: { masterchef },
    },
    tokens: { YUZU },
  },
} = addressBook;

const getYuzuApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: masterchef,
    tokenPerBlock: 'yuzuPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: YUZU.symbol,
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: await getBlockTime(chainId),
    // log: true,
  });

module.exports = getYuzuApys;
