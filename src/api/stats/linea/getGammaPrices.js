const getGammaPrices = require('../common/getGammaPrices');
import gammaPools from '../../../data/linea/lynexGammaPools.json';
import ichiPools from '../../../data/linea/lynexIchiPools.json';
const { LINEA_CHAIN_ID: chainId } = require('../../../constants');

const pools = [...gammaPools, ...ichiPools];
const getGammaLineaPrices = async tokenPrices => {
  return await getGammaPrices(chainId, pools, tokenPrices);
};

export default getGammaLineaPrices;
