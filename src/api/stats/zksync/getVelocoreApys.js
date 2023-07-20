const { ZKSYNC_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/zksync/velocoreStableLpPools.json');
const volatilePools = require('../../../data/zksync/velocoreLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  zksync: {
    tokens: { VC },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelocoreApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VC',
    oracle: 'tokens',
    decimals: '1e18',
    reward: VC.address,
    boosted: false,
    // log: true,
  });

module.exports = getVelocoreApys;
