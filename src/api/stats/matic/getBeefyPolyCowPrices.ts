import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/matic/beefyCowVaults.json');

export const getBeefyCowPolyPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
