const getGammaPrices = require('../common/getGammaPrices');
const beamswapPools = require('../../../data/moonbeam/beamswapGammaPools.json');
const stellaPools = require('../../../data/moonbeam/stellaGammaPools.json');
const uniswapPools = require('../../../data/moonbeam/uniswapGammaPools.json');
const { MOONBEAM_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...beamswapPools, ...stellaPools, ...uniswapPools];
const getGammaMoonbeamPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

module.exports = getGammaMoonbeamPrices;
