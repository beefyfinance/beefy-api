import { SONIC_CHAIN_ID as chainId } from '../../../constants';
import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/sonic/siloPools.json');
const params: SiloApyParams = {
  chainId,
  pools,
  // log: true,
};

const getSonicSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getSonicSiloApys };
