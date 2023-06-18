const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/arbitrum/solidlizardStableLpPools.json');
const volatilePools = require('../../../data/arbitrum/solidlizardLpPools.json');

const {
  arbitrum: {
    platforms: { solidlizard },
    tokens: { SLIZ },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getSolidLizardApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'SLIZ',
    oracle: 'tokens',
    decimals: '1e36', // token is 1e18 but gauge.rewardRate returns 1e36
    reward: SLIZ.address,
    boosted: true,
    NFTid: 1629,
    ve: solidlizard.ve,
    gaugeStaker: solidlizard.gaugeStaker,
    // log: true,
  });
};

module.exports = getSolidLizardApys;
