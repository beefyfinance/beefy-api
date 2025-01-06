const getStargateV2Prices = require('../common/stargate/getStargateV2Prices');
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');
const poolsV2 = require('../../../data/linea/stargateV2LineaPools.json');

const getStargateLineaPrices = async tokenPrices => {
  return getStargateV2Prices(chainId, poolsV2, tokenPrices);
};

module.exports = getStargateLineaPrices;
