const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const volatilePools = require('../../../data/base/bvmLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  base: {
    tokens: { BVM },
  },
} = addressBook;

const pools = [...volatilePools];
const getBvmApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'oBVM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: BVM.address,
    boosted: false,
    // log: true,
  });

module.exports = getBvmApys;
