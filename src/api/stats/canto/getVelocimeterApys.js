const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stableV2Pools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const volatileV2Pools = require('../../../data/canto/velocimeterV2LpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  canto: {
    tokens: { FLOW },
  },
} = addressBook;

const poolsV2 = [...stableV2Pools, ...volatileV2Pools];
const getVelocimeterApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: poolsV2,
    oracleId: 'FLOW',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FLOW.address,
    boosted: false,
    // log: true,
  });

module.exports = getVelocimeterApys;
