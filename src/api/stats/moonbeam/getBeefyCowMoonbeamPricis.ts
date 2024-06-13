import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { MOONBEAM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/moonbeam/beefyCowVaults.json');

export const getBeefyCowMoonbeamPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
