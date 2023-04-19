const { bscWeb3: web3 } = require('../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const { getRewardPoolApys } = require('../common/getRewardPoolApys');
const stablePools = require('../../../data/degens/thenaStableLpPools.json');
const volatilePools = require('../../../data/degens/thenaLpPools.json');
const stableV2Pools = require('../../../data/degens/thenaV2StableLpPools.json');
const volatileV2Pools = require('../../../data/degens/thenaV2LpPools.json');

const {
  bsc: {
    tokens: { THE },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools, ...stableV2Pools, ...volatileV2Pools];
const getThenaApys = async () => {
  return getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'THE',
    oracle: 'tokens',
    decimals: '1e18', // token is 1e18 but gauge.rewardRate returns 1e36
    // log: true,
  });
};

module.exports = getThenaApys;
