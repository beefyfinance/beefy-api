import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/sonic/siloPools.json');
const params: SiloApyParams = {
  chainKey: 'sonic', // chainkey string for the silo API
  pools,
  // log: true,
};

const getSonicSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getSonicSiloApys };
