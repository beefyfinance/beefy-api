const getTokemakPrices = require('../common/getTokemakPrices');
const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/base/tokemakPools.json');

const getTokemakBasePrices = async tokenPrices => {
  return await getTokemakPrices(chainId, pools, tokenPrices);
};

export default getTokemakBasePrices;
