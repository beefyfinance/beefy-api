import { getBeefyCowcentratedVaultPrices } from '../common/getBeefyCowcentratedVaultPrices';
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/arbitrum/beefyCowVaults.json');

export const getBeefyCowArbPrices = async tokenPrices => {
  return await getBeefyCowcentratedVaultPrices(chainId, pools, tokenPrices);
};
