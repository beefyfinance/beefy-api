import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/base/beefyCowVaults.json');

export const getBeefyCowBasePrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
