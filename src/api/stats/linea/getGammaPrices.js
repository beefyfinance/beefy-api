const getGammaPrices = require('../common/getGammaPrices');
import pools from '../../../data/linea/lynexGammaPools.json';
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const getGammaLineaPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

export default getGammaLineaPrices;
