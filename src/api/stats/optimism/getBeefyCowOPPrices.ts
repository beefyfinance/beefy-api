import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/optimism/beefyCowVaults.json');

export const getBeefyCowOPPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
