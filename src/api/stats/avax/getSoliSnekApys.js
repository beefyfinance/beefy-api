const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/avax/soliSnekStableLpPools.json');
const volatilePools = require('../../../data/avax/soliSnekLpPools.json');

const {
  avax: {
    platforms: { solisnek },
    tokens: { SNEK },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getSoliSnekApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'SNEK',
    oracle: 'tokens',
    decimals: '1e18',
    reward: SNEK.address,
    spirit: false,
    boosted: true,
    NFTid: 1594,
    ve: solisnek.ve,
    gaugeStaker: solisnek.gaugeStaker,
    //log: true,
  });
};

module.exports = getSoliSnekApys;
