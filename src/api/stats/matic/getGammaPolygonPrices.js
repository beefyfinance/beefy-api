const getGammaPrices = require('../common/getGammaPrices');
const quickPools = require('../../../data/matic/quickGammaLpPools.json');
const uniswapPools = require('../../../data/matic/uniswapGammaPools.json');
const retroPools = require('../../../data/matic/retroGammaPools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');

const pools = [...quickPools, ...uniswapPools, ...retroPools];

const getGammaPolygonPrices = async tokenPrices => {
  return await getGammaPrices(POLYGON_CHAIN_ID, pools, tokenPrices);
};

module.exports = getGammaPolygonPrices;
