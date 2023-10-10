const getBunniPrices = require('../common/getBunniPrices');
const pools = require('../../../data/arbitrum/bunniPools.json');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  arbitrum: {
    platforms: {
      bunni: { lens },
    },
  },
} = addressBook;

const getBunniArbPrices = async tokenPrices => {
  return await getBunniPrices(chainId, pools, tokenPrices, lens);
};

export default getBunniArbPrices;
