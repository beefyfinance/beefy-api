import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/optimism/siloPools.json');
const params: SiloApyParams = {
  chainId,
  pools,
  // log: true,
};

const getOpSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getOpSiloApys };
