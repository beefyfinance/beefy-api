const { bscWeb3: web3 } = require('../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/coneStableLpPools.json');
const volatilePools = require('../../../data/coneLpPools.json');

const {
  bsc: {
    platforms: { cone },
    tokens: { CONE },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getConeApys = async () => {
  return getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'CONE',
    oracle: 'tokens',
    decimals: '1e36', // token is 1e18 but gauge.rewardRate returns 1e36
    reward: CONE.address,
    boosted: true,
    NFTid: 223,
    ve: cone.ve,
    gaugeStaker: cone.gaugeStaker,
    // log: true,
  });
};

module.exports = getConeApys;
