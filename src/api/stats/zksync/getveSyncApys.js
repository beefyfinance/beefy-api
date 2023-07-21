const { ZKSYNC_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const volatilePools = require('../../../data/zksync/veSyncLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  zksync: {
    tokens: { VS },
  },
} = addressBook;

const pools = [...volatilePools];
const getveSyncApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VSzk',
    oracle: 'tokens',
    decimals: '1e18',
    reward: VS.address,
    boosted: false,
    // log: true,
  });

module.exports = getveSyncApys;
