const { ZKSYNC_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const volatilePools = require('../../../data/zksync/draculaLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  zksync: {
    tokens: { FANG },
  },
} = addressBook;

const pools = [...volatilePools];
const getDraculaApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'FANG',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FANG.address,
    boosted: false,
    // log: true,
  });

module.exports = getDraculaApys;
