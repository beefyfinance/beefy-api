const { BASE_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/base/basoStableLpPools.json');
const volatilePools = require('../../../data/base/basoLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  base: {
    tokens: { BASO },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getBasoApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: BASO.symbol,
    oracle: 'tokens',
    decimals: getEDecimals(BASO.decimals),
    reward: BASO.address,
    boosted: false,
    // log: true,
  });
};

module.exports = getBasoApys;
