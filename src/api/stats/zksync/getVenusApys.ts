import { ZKSYNC_CHAIN_ID as chainId } from '../../../constants';
import getVenusApyData from '../common/getVenusApys';
import { VenusApyParams, VenusPool } from '../common/getVenusApys';

const corePools: VenusPool[] = require('../../../data/zksync/venusCorePools.json');

const coreParams: VenusApyParams = {
  chainId,
  comptroller: '0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1',
  compOracleId: 'zkXVS',
  pools: corePools,
};

const getVenusApys = async () => {
  return await getVenusApyData(coreParams);
};

module.exports = getVenusApys;
