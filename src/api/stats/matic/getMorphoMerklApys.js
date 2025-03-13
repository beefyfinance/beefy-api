import { POLYGON_CHAIN_ID as chainId } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';
import { getMerklApys } from '../common/getMerklApys';
const pools = require('../../../data/matic/morphoPools.json');

const getMorphoMerklApys = async () => {
  const morphoMerklPools = pools.filter(pool => pool.merkl);
  const merklApys = await getMerklApys(chainId, morphoMerklPools);
  return getApyBreakdown(morphoMerklPools, 0, merklApys, 0);
};

module.exports = { getMorphoMerklApys };
