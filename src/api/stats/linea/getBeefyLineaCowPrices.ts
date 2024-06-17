import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/linea/beefyCowVaults.json');

export const getBeefyCowLineaPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
