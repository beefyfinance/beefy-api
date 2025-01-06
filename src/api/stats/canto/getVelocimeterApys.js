const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';

const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const volatileV2Pools = require('../../../data/canto/velocimeterV2LpPools.json');

import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  canto: {
    tokens: { FLOW },
  },
} = addressBook;

const poolsV2 = [...volatileV2Pools];
const getVelocimeterApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: poolsV2,
    oracleId: 'FLOW',
    oracle: 'tokens',
    decimals: getEDecimals(FLOW.decimals),
    reward: FLOW.address,
    boosted: false,
    // log: true,
  });
};

module.exports = getVelocimeterApys;
