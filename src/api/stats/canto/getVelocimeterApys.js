const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const volatilePools = require('../../../data/canto/velocimeterV2LpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  canto: {
    tokens: { FLOW },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelocimeterApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'FLOW',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FLOW.address,
    boosted: false,
    // log: true,
  });

module.exports = getVelocimeterApys;
