const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/base/bvmStableLpPools.json');
const volatilePools = require('../../../data/base/bvmLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const { BVM } = addressBook.base.tokens;

const pools = [...stablePools, ...volatilePools];
const getBvmApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'oBVM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: BVM.address,
    // log: true,
  });

module.exports = getBvmApys;
