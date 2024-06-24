import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { ZKSYNC_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/zksync/beefyCowVaults.json');

export const getBeefyCowZkSyncPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
